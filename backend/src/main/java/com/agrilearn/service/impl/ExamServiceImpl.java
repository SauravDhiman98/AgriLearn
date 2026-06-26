package com.agrilearn.service.impl;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.entity.*;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.*;
import com.agrilearn.service.ExamService;
import com.agrilearn.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepo;
    private final ExamSubjectRepository subjectRepo;
    private final SubjectChapterRepository chapterRepo;
    private final ChapterNotesRepository notesRepo;
    private final ChapterVideoRepository videoRepo;
    private final McqTestRepository testRepo;
    private final ExamSectionRepository sectionRepo;
    private final MinioService minioService;

    @Value("${minio.bucket.documents}")
    private String documentsBucket;

    @Value("${server.servlet.context-path:/api/v1}")
    private String contextPath;

    @Override
    @Transactional(readOnly = true)
    public List<ExamDto.ExamResponse> getAllExams() {
        return examRepo.findByActiveTrueOrderByNameAsc().stream()
                .map(this::toExamResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDto.ExamDetailResponse getExamById(Long id) {
        Exam exam = examRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Exam", id));
        ExamDto.ExamDetailResponse r = new ExamDto.ExamDetailResponse();
        r.setId(exam.getId());
        r.setName(exam.getName());
        r.setDescription(exam.getDescription());
        r.setIcon(exam.getIcon());
        r.setSlug(exam.getSlug());
        r.setSubjects(subjectRepo.findByExamIdOrderByOrderIndexAsc(id).stream()
                .map(this::toSubjectResponse)
                .collect(Collectors.toList()));
        r.setSections(sectionRepo.findByExamIdOrderByOrderIndex(id).stream()
                .map(this::toSectionResponse)
                .collect(Collectors.toList()));
        return r;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDto.SectionResponse> getSectionsByExam(Long examId) {
        if (!examRepo.existsById(examId)) {
            throw new ResourceNotFoundException("Exam", examId);
        }
        return sectionRepo.findByExamIdOrderByOrderIndex(examId).stream()
                .map(this::toSectionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDto.SubjectDetailResponse getSubjectById(Long id) {
        ExamSubject subject = subjectRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subject", id));
        ExamDto.SubjectDetailResponse r = new ExamDto.SubjectDetailResponse();
        r.setId(subject.getId());
        r.setExamId(subject.getExam().getId());
        r.setExamName(subject.getExam().getName());
        r.setName(subject.getName());
        r.setDescription(subject.getDescription());
        r.setIcon(subject.getIcon());
        r.setChapters(chapterRepo.findBySubjectIdOrderByOrderIndexAsc(id).stream()
                .map(this::toChapterResponse)
                .collect(Collectors.toList()));
        return r;
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDto.ChapterDetailResponse getChapterById(Long id) {
        SubjectChapter chapter = chapterRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Chapter", id));
        ExamDto.ChapterDetailResponse r = new ExamDto.ChapterDetailResponse();
        r.setId(chapter.getId());
        r.setSubjectId(chapter.getSubject().getId());
        r.setSubjectName(chapter.getSubject().getName());
        r.setExamName(chapter.getSubject().getExam().getName());
        r.setTitle(chapter.getTitle());
        r.setDescription(chapter.getDescription());
        r.setNotes(notesRepo.findByChapterIdOrderByOrderIndexAsc(id).stream()
                .map(this::toNotesResponse)
                .collect(Collectors.toList()));
        r.setVideos(videoRepo.findByChapterIdOrderByOrderIndexAsc(id).stream()
                .map(this::toVideoResponse)
                .collect(Collectors.toList()));
        r.setTests(testRepo.findByChapterIdOrderByCreatedAtDesc(id).stream()
                .map(this::toMcqTestResponse)
                .collect(Collectors.toList()));
        return r;
    }

    @Override
    public ExamDto.ExamResponse createExam(ExamDto.CreateExamRequest req) {
        Exam exam = Exam.builder()
                .name(req.getName())
                .description(req.getDescription())
                .icon(req.getIcon())
                .slug(req.getSlug())
                .build();
        return toExamResponse(examRepo.save(exam));
    }

    @Override
    public ExamDto.ExamResponse updateExam(Long examId, ExamDto.CreateExamRequest req) {
        Exam exam = examRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException("Exam", examId));
        if (req.getName() != null && !req.getName().isBlank()) exam.setName(req.getName());
        if (req.getDescription() != null) exam.setDescription(req.getDescription());
        if (req.getIcon() != null) exam.setIcon(req.getIcon());
        if (req.getSlug() != null && !req.getSlug().isBlank()) exam.setSlug(req.getSlug());
        return toExamResponse(examRepo.save(exam));
    }

    @Override
    public ExamDto.SectionResponse createSection(Long examId, ExamDto.CreateSectionRequest req) {
        Exam exam = examRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException("Exam", examId));
        ExamSection section = ExamSection.builder()
                .exam(exam)
                .title(req.getTitle())
                .description(req.getDescription())
                .sectionType(req.getSectionType() == null || req.getSectionType().isBlank() ? "CUSTOM" : req.getSectionType())
                .tableHeaders(req.getTableHeaders())
                .tableRows(req.getTableRows())
                .orderIndex(req.getOrderIndex())
                .build();
        return toSectionResponse(sectionRepo.save(section));
    }

    @Override
    public ExamDto.SectionResponse updateSection(Long sectionId, ExamDto.CreateSectionRequest req) {
        ExamSection section = sectionRepo.findById(sectionId).orElseThrow(() -> new ResourceNotFoundException("Section", sectionId));
        section.setTitle(req.getTitle());
        section.setDescription(req.getDescription());
        section.setSectionType(req.getSectionType() == null || req.getSectionType().isBlank() ? "CUSTOM" : req.getSectionType());
        section.setTableHeaders(req.getTableHeaders());
        section.setTableRows(req.getTableRows());
        section.setOrderIndex(req.getOrderIndex());
        return toSectionResponse(sectionRepo.save(section));
    }

    @Override
    public ExamDto.SubjectResponse createSubject(Long examId, ExamDto.CreateSubjectRequest req) {
        Exam exam = examRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException("Exam", examId));
        ExamSubject subject = ExamSubject.builder()
                .exam(exam)
                .name(req.getName())
                .description(req.getDescription())
                .icon(req.getIcon())
                .orderIndex(req.getOrderIndex())
                .build();
        return toSubjectResponse(subjectRepo.save(subject));
    }

    @Override
    public ExamDto.ChapterResponse createChapter(Long subjectId, ExamDto.CreateChapterRequest req) {
        ExamSubject subject = subjectRepo.findById(subjectId).orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));
        SubjectChapter chapter = SubjectChapter.builder()
                .subject(subject)
                .title(req.getTitle())
                .description(req.getDescription())
                .orderIndex(req.getOrderIndex())
                .build();
        return toChapterResponse(chapterRepo.save(chapter));
    }

    @Override
    public ExamDto.NotesResponse createNotes(Long chapterId, ExamDto.CreateNotesRequest req) {
        SubjectChapter chapter = chapterRepo.findById(chapterId).orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId));
        ChapterNotes notes = ChapterNotes.builder()
                .chapter(chapter)
                .title(req.getTitle())
                .content(req.getContent())
                .orderIndex(req.getOrderIndex())
                .build();
        return toNotesResponse(notesRepo.save(notes));
    }

    @Override
    public ExamDto.NotesResponse updateNotes(Long notesId, ExamDto.CreateNotesRequest req) {
        ChapterNotes notes = notesRepo.findById(notesId).orElseThrow(() -> new ResourceNotFoundException("Notes", notesId));
        notes.setTitle(req.getTitle());
        notes.setContent(req.getContent());
        notes.setOrderIndex(req.getOrderIndex());
        return toNotesResponse(notesRepo.save(notes));
    }

    @Override
    public ExamDto.VideoResponse createVideo(Long chapterId, ExamDto.CreateVideoRequest req) {
        SubjectChapter chapter = chapterRepo.findById(chapterId).orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId));
        ChapterVideo video = ChapterVideo.builder()
                .chapter(chapter)
                .title(req.getTitle())
                .youtubeUrl(req.getYoutubeUrl())
                .youtubeVideoId(extractYoutubeId(req.getYoutubeUrl()))
                .description(req.getDescription())
                .orderIndex(req.getOrderIndex())
                .build();
        return toVideoResponse(videoRepo.save(video));
    }

    @Override
    public void deleteNotes(Long notesId) {
        ChapterNotes notes = notesRepo.findById(notesId).orElseThrow(() -> new ResourceNotFoundException("Notes", notesId));
        if (notes.getFileUrl() != null && !notes.getFileUrl().isBlank()) {
            minioService.deleteFile(documentsBucket, notes.getFileUrl());
        }
        notesRepo.delete(notes);
    }

    @Override
    public void deleteSection(Long sectionId) {
        ExamSection section = sectionRepo.findById(sectionId).orElseThrow(() -> new ResourceNotFoundException("Section", sectionId));
        sectionRepo.delete(section);
    }

    @Override
    public void deleteVideo(Long videoId) {
        if (!videoRepo.existsById(videoId)) {
            throw new ResourceNotFoundException("Video", videoId);
        }
        videoRepo.deleteById(videoId);
    }

    @Override
    public void deleteChapter(Long chapterId) {
        if (!chapterRepo.existsById(chapterId)) {
            throw new ResourceNotFoundException("Chapter", chapterId);
        }
        chapterRepo.deleteById(chapterId);
    }

    @Override
    public void deleteSubject(Long subjectId) {
        if (!subjectRepo.existsById(subjectId)) {
            throw new ResourceNotFoundException("Subject", subjectId);
        }
        subjectRepo.deleteById(subjectId);
    }

    private String extractYoutubeId(String url) {
        if (url == null) {
            return null;
        }
        Pattern p = Pattern.compile("(?:v=|youtu\\.be/|embed/)([a-zA-Z0-9_-]{11})");
        Matcher m = p.matcher(url);
        return m.find() ? m.group(1) : null;
    }

    private ExamDto.ExamResponse toExamResponse(Exam exam) {
        ExamDto.ExamResponse r = new ExamDto.ExamResponse();
        r.setId(exam.getId());
        r.setName(exam.getName());
        r.setDescription(exam.getDescription());
        r.setIcon(exam.getIcon());
        r.setSlug(exam.getSlug());
        r.setActive(exam.isActive());
        r.setSubjectCount(subjectRepo.findByExamIdOrderByOrderIndexAsc(exam.getId()).size());
        return r;
    }

    private ExamDto.SubjectResponse toSubjectResponse(ExamSubject subject) {
        ExamDto.SubjectResponse r = new ExamDto.SubjectResponse();
        r.setId(subject.getId());
        r.setName(subject.getName());
        r.setDescription(subject.getDescription());
        r.setIcon(subject.getIcon());
        r.setOrderIndex(subject.getOrderIndex());
        r.setChapterCount(chapterRepo.findBySubjectIdOrderByOrderIndexAsc(subject.getId()).size());
        return r;
    }

    private ExamDto.ChapterResponse toChapterResponse(SubjectChapter chapter) {
        ExamDto.ChapterResponse r = new ExamDto.ChapterResponse();
        r.setId(chapter.getId());
        r.setTitle(chapter.getTitle());
        r.setDescription(chapter.getDescription());
        r.setOrderIndex(chapter.getOrderIndex());
        r.setNotesCount(notesRepo.findByChapterIdOrderByOrderIndexAsc(chapter.getId()).size());
        r.setVideosCount(videoRepo.findByChapterIdOrderByOrderIndexAsc(chapter.getId()).size());
        r.setTestsCount(testRepo.findByChapterIdOrderByCreatedAtDesc(chapter.getId()).size());
        return r;
    }

    private ExamDto.NotesResponse toNotesResponse(ChapterNotes notes) {
        ExamDto.NotesResponse r = new ExamDto.NotesResponse();
        r.setId(notes.getId());
        r.setTitle(notes.getTitle());
        r.setContent(notes.getContent());
        r.setOrderIndex(notes.getOrderIndex());
        r.setFileUrl(resolveNotesFileUrl(notes.getFileUrl()));
        r.setFileName(notes.getFileName());
        r.setFileSize(notes.getFileSize());
        r.setFileType(notes.getFileType());
        return r;
    }

    private ExamDto.SectionResponse toSectionResponse(ExamSection section) {
        return ExamDto.SectionResponse.builder()
                .id(section.getId())
                .title(section.getTitle())
                .description(section.getDescription())
                .sectionType(section.getSectionType())
                .tableHeaders(section.getTableHeaders())
                .tableRows(section.getTableRows())
                .orderIndex(section.getOrderIndex())
                .build();
    }

    private ExamDto.VideoResponse toVideoResponse(ChapterVideo video) {
        ExamDto.VideoResponse r = new ExamDto.VideoResponse();
        r.setId(video.getId());
        r.setTitle(video.getTitle());
        r.setYoutubeUrl(video.getYoutubeUrl());
        r.setYoutubeVideoId(video.getYoutubeVideoId());
        r.setDescription(video.getDescription());
        r.setOrderIndex(video.getOrderIndex());
        return r;
    }

    private ExamDto.McqTestResponse toMcqTestResponse(McqTest test) {
        ExamDto.McqTestResponse r = new ExamDto.McqTestResponse();
        r.setId(test.getId());
        r.setTitle(test.getTitle());
        r.setAiGenerated(test.isAiGenerated());
        r.setTotalQuestions(test.getTotalQuestions());
        r.setTimeLimitMinutes(test.getTimeLimitMinutes());
        r.setNotesId(test.getNotes() != null ? test.getNotes().getId() : null);
        return r;
    }

    private String resolveNotesFileUrl(String storedObjectName) {
        if (storedObjectName == null || storedObjectName.isBlank()) {
            return null;
        }
        // Always proxy through backend to avoid CORS issues with B2/MinIO
        return contextPath + "/files/proxy/" + documentsBucket + "/" + storedObjectName;
    }
}
