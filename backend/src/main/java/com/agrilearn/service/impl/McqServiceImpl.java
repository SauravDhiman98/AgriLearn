package com.agrilearn.service.impl;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.entity.*;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.*;
import com.agrilearn.service.AiMcqGeneratorService;
import com.agrilearn.service.McqService;
import com.agrilearn.service.MinioService;
import org.springframework.beans.factory.annotation.Value;
import java.io.InputStream;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.Loader;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class McqServiceImpl implements McqService {

    private final McqTestRepository testRepo;
    private final McqQuestionRepository questionRepo;
    private final McqAttemptRepository attemptRepo;
    private final ChapterNotesRepository notesRepo;
    private final SubjectChapterRepository chapterRepo;
    private final UserRepository userRepo;
    private final AiMcqGeneratorService aiService;
    private final ObjectMapper objectMapper;
    private final MinioService minioService;

    @Value("${minio.bucket.documents:agrilearn-documents}")
    private String documentsBucket;

    @Override
    @Transactional(readOnly = true)
    public ExamDto.McqTestDetailResponse getTestWithQuestions(Long testId, boolean includeAnswers) {
        McqTest test = testRepo.findById(testId).orElseThrow(() -> new ResourceNotFoundException("Test", testId));
        ExamDto.McqTestDetailResponse r = new ExamDto.McqTestDetailResponse();
        r.setId(test.getId());
        r.setTitle(test.getTitle());
        r.setAiGenerated(test.isAiGenerated());
        r.setTotalQuestions(test.getTotalQuestions());
        r.setTimeLimitMinutes(test.getTimeLimitMinutes());

        List<McqQuestion> questions = questionRepo.findByTestIdOrderByOrderIndexAsc(testId);
        if (includeAnswers) {
            r.setQuestions(questions.stream().map(this::toQuestionWithAnswerResponse).collect(Collectors.toList()));
        } else {
            r.setQuestions(questions.stream().map(this::toQuestionResponse).collect(Collectors.toList()));
        }
        return r;
    }

    @Override
    public ExamDto.McqAttemptResponse submitAttempt(Long userId, ExamDto.McqAttemptRequest req) {
        McqTest test = testRepo.findById(req.getTestId()).orElseThrow(() -> new ResourceNotFoundException("Test", req.getTestId()));
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        List<McqQuestion> questions = questionRepo.findByTestIdOrderByOrderIndexAsc(req.getTestId());

        int score = 0;
        Map<Long, String> answers = req.getAnswers() != null ? req.getAnswers() : new HashMap<>();
        for (McqQuestion q : questions) {
            String selected = answers.get(q.getId());
            if (selected != null && selected.equalsIgnoreCase(q.getCorrectOption())) {
                score++;
            }
        }

        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            log.warn("Failed to serialize MCQ answers", e);
            answersJson = "{}";
        }

        McqAttempt attempt = McqAttempt.builder()
                .user(user)
                .test(test)
                .score(score)
                .totalQuestions(questions.size())
                .answers(answersJson)
                .build();
        attempt = attemptRepo.save(attempt);

        ExamDto.McqAttemptResponse r = new ExamDto.McqAttemptResponse();
        r.setId(attempt.getId());
        r.setScore(score);
        r.setTotalQuestions(questions.size());
        r.setCorrectAnswers(score);
        r.setWrongAnswers(questions.size() - score);
        r.setPercentage(questions.isEmpty() ? 0 : (double) score / questions.size() * 100);
        r.setUserAnswers(answers);
        r.setQuestions(questions.stream().map(this::toQuestionWithAnswerResponse).collect(Collectors.toList()));
        return r;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDto.McqAttemptResponse> getUserAttempts(Long userId, Long testId) {
        return attemptRepo.findByUserIdAndTestIdOrderByCompletedAtDesc(userId, testId).stream()
                .map(a -> {
                    ExamDto.McqAttemptResponse r = new ExamDto.McqAttemptResponse();
                    r.setId(a.getId());
                    r.setScore(a.getScore());
                    r.setTotalQuestions(a.getTotalQuestions());
                    r.setPercentage(a.getTotalQuestions() == 0 ? 0 : (double) a.getScore() / a.getTotalQuestions() * 100);
                    r.setUserAnswers(parseAnswers(a.getAnswers()));
                    return r;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ExamDto.McqTestResponse generateAiMcq(Long notesId, int questionCount, Long chapterId) {
        ChapterNotes notes = notesRepo.findById(notesId).orElseThrow(() -> new ResourceNotFoundException("Notes", notesId));
        SubjectChapter chapter = chapterRepo.findById(chapterId).orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId));

        if (!notes.getChapter().getId().equals(chapterId)) {
            throw new BadRequestException("Notes do not belong to the provided chapter");
        }
        log.info("=== MCQ Generation Start ===");
        log.info("Notes ID: {}, Chapter ID: {}, Question Count: {}", notesId, chapterId, questionCount);
        log.info("Notes title: {}", notes.getTitle());
        log.info("Notes fileUrl: {}", notes.getFileUrl());
        log.info("Notes content (raw): [{}]", notes.getContent());

        String notesContent = notes.getContent();
        if (notesContent == null || notesContent.isBlank()) {
            log.info("Content is empty — attempting PDF text extraction from: {}", notes.getFileUrl());
            notesContent = extractTextFromPdf(notes.getFileUrl());
            log.info("Extracted content length: {} chars", notesContent == null ? 0 : notesContent.length());
            log.info("Extracted content preview: [{}]", notesContent != null && notesContent.length() > 200 ? notesContent.substring(0, 200) + "..." : notesContent);
        } else {
            log.info("Using stored text content, length: {} chars", notesContent.length());
        }
        log.info("Final content being sent to AI (first 300 chars): [{}]",
                notesContent != null && notesContent.length() > 300 ? notesContent.substring(0, 300) + "..." : notesContent);
        List<ExamDto.McqQuestionWithAnswerResponse> aiQuestions = aiService.generateQuestions(notesContent, questionCount);
        if (aiQuestions.isEmpty()) {
            throw new BadRequestException("AI could not generate MCQ questions for these notes");
        }

        McqTest test = McqTest.builder()
                .chapter(chapter)
                .notes(notes)
                .title("MCQ: " + notes.getTitle())
                .aiGenerated(true)
                .totalQuestions(aiQuestions.size())
                .timeLimitMinutes(aiQuestions.size() * 2)
                .build();
        test = testRepo.save(test);

        final McqTest savedTest = test;
        List<McqQuestion> savedQuestions = new ArrayList<>();
        for (int i = 0; i < aiQuestions.size(); i++) {
            ExamDto.McqQuestionWithAnswerResponse q = aiQuestions.get(i);
            McqQuestion mq = McqQuestion.builder()
                    .test(savedTest)
                    .question(q.getQuestion())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .correctOption(q.getCorrectOption())
                    .explanation(q.getExplanation())
                    .orderIndex(i)
                    .build();
            savedQuestions.add(mq);
        }
        questionRepo.saveAll(savedQuestions);

        ExamDto.McqTestResponse r = new ExamDto.McqTestResponse();
        r.setId(test.getId());
        r.setTitle(test.getTitle());
        r.setAiGenerated(true);
        r.setTotalQuestions(savedQuestions.size());
        r.setTimeLimitMinutes(test.getTimeLimitMinutes());
        r.setNotesId(notesId);
        return r;
    }

    private String extractTextFromPdf(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            log.warn("No fileUrl available for PDF text extraction");
            return "";
        }
        try (InputStream is = minioService.streamFile(documentsBucket, fileUrl)) {
            byte[] pdfBytes = is.readAllBytes();
            try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
                String text = new PDFTextStripper().getText(doc);
                log.info("Extracted {} characters from PDF: {}", text.length(), fileUrl);
                return text;
            }
        } catch (Exception e) {
            log.error("Failed to extract text from PDF {}: {}", fileUrl, e.getMessage());
            return "";
        }
    }

    private Map<Long, String> parseAnswers(String answersJson) {
        if (answersJson == null || answersJson.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(answersJson, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to parse MCQ attempt answers", e);
            return new HashMap<>();
        }
    }

    private ExamDto.McqQuestionResponse toQuestionResponse(McqQuestion q) {
        ExamDto.McqQuestionResponse qr = new ExamDto.McqQuestionResponse();
        qr.setId(q.getId());
        qr.setQuestion(q.getQuestion());
        qr.setOptionA(q.getOptionA());
        qr.setOptionB(q.getOptionB());
        qr.setOptionC(q.getOptionC());
        qr.setOptionD(q.getOptionD());
        qr.setOrderIndex(q.getOrderIndex());
        return qr;
    }

    private ExamDto.McqQuestionWithAnswerResponse toQuestionWithAnswerResponse(McqQuestion q) {
        ExamDto.McqQuestionWithAnswerResponse qr = new ExamDto.McqQuestionWithAnswerResponse();
        qr.setId(q.getId());
        qr.setQuestion(q.getQuestion());
        qr.setOptionA(q.getOptionA());
        qr.setOptionB(q.getOptionB());
        qr.setOptionC(q.getOptionC());
        qr.setOptionD(q.getOptionD());
        qr.setCorrectOption(q.getCorrectOption());
        qr.setExplanation(q.getExplanation());
        qr.setOrderIndex(q.getOrderIndex());
        return qr;
    }
}
