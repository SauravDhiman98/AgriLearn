package com.agrilearn.controller;

import com.agrilearn.entity.*;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * CSV upload endpoints for bulk data import.
 *
 * MCQ CSV format (with header row):
 *   question,optionA,optionB,optionC,optionD,correctOption,explanation
 *
 * Exam Info CSV format (type-tagged rows):
 *   type,col1,col2,col3,col4,col5
 *   SECTION,Eligibility,,,,
 *   HEADERS,Criterion,Details,,,
 *   ROW,Age Limit,18-35 years,,,
 *   ROW,Education,Graduate,,,
 *   SECTION,Exam Pattern,,,,
 *   HEADERS,Section,Questions,Marks,Duration,
 *   ROW,General Knowledge,50,50,2 hrs,
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
public class CsvUploadController {

    private final McqTestRepository mcqTestRepo;
    private final McqQuestionRepository mcqQuestionRepo;
    private final SubjectChapterRepository chapterRepo;
    private final ExamRepository examRepo;
    private final ExamSectionRepository sectionRepo;
    private final ObjectMapper objectMapper;
    private final com.agrilearn.service.AiMcqGeneratorService aiService;

    // ── MCQ CSV Upload ──────────────────────────────────────────────────────

    @PostMapping("/admin/chapters/{chapterId}/mcq/upload-csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadMcqCsv(
            @PathVariable Long chapterId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "testTitle", defaultValue = "") String testTitle) throws Exception {

        SubjectChapter chapter = chapterRepo.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId));

        List<String[]> rows = parseCsv(file);
        if (rows.isEmpty()) throw new BadRequestException("CSV file is empty");

        // Skip header row
        List<McqQuestion> questions = new ArrayList<>();
        String title = testTitle.isBlank() ? "MCQ: " + chapter.getTitle() : testTitle;

        McqTest test = McqTest.builder()
                .chapter(chapter)
                .title(title)
                .aiGenerated(false)
                .totalQuestions(0)
                .timeLimitMinutes(0)
                .build();
        test = mcqTestRepo.save(test);

        int orderIdx = 0;
        for (String[] row : rows) {
            if (row.length < 6) continue;
            String question = clean(row[0]);
            if (question.isEmpty()) continue;

            McqQuestion q = McqQuestion.builder()
                    .test(test)
                    .question(question)
                    .optionA(clean(row[1]))
                    .optionB(clean(row[2]))
                    .optionC(clean(row[3]))
                    .optionD(clean(row[4]))
                    .correctOption(clean(row[5]).toUpperCase())
                    .explanation(row.length > 6 ? clean(row[6]) : null)
                    .orderIndex(orderIdx++)
                    .build();
            questions.add(q);
        }

        if (questions.isEmpty()) throw new BadRequestException("No valid questions found in CSV");

        mcqQuestionRepo.saveAll(questions);
        test.setTotalQuestions(questions.size());
        test.setTimeLimitMinutes(questions.size() * 2);
        mcqTestRepo.save(test);

        log.info("Uploaded {} MCQ questions from CSV for chapter {}", questions.size(), chapterId);
        return ResponseEntity.ok(Map.of(
                "testId", test.getId(),
                "testTitle", test.getTitle(),
                "questionsCreated", questions.size()
        ));
    }

    @GetMapping("/admin/mcq/template")
    public ResponseEntity<String> getMcqTemplate() {
        String csv = "question,optionA,optionB,optionC,optionD,correctOption,explanation\n" +
                "\"What is photosynthesis?\",\"Making food from sunlight\",\"Breaking down food\",\"Absorbing water\",\"Releasing CO2\",\"A\",\"Plants convert sunlight to glucose\"\n" +
                "\"Which gas do plants absorb?\",\"Oxygen\",\"Nitrogen\",\"Carbon Dioxide\",\"Hydrogen\",\"C\",\"Plants use CO2 for photosynthesis\"\n";
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=mcq_template.csv")
                .header("Content-Type", "text/csv")
                .body(csv);
    }

    // ── Exam Info CSV Upload ────────────────────────────────────────────────

    @PostMapping("/admin/exams/{examId}/sections/upload-csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadExamInfoCsv(
            @PathVariable Long examId,
            @RequestParam("file") MultipartFile file) throws Exception {

        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));

        List<String[]> rows = parseCsv(file);
        if (rows.isEmpty()) throw new BadRequestException("CSV file is empty");

        // Parse type-tagged rows: SECTION / HEADERS / ROW
        List<ExamSection> sections = new ArrayList<>();
        String currentTitle = null;
        List<String> currentHeaders = null;
        List<List<String>> currentRows = null;
        int orderIdx = sectionRepo.findByExamIdOrderByOrderIndex(examId).size();

        for (String[] row : rows) {
            if (row.length == 0) continue;
            String type = clean(row[0]).toUpperCase();

            switch (type) {
                case "SECTION" -> {
                    // Save previous section if any
                    if (currentTitle != null && currentHeaders != null) {
                        sections.add(buildSection(exam, currentTitle, currentHeaders, currentRows, orderIdx++));
                    }
                    currentTitle = row.length > 1 ? clean(row[1]) : "";
                    currentHeaders = null;
                    currentRows = new ArrayList<>();
                }
                case "HEADERS" -> {
                    currentHeaders = new ArrayList<>();
                    for (int i = 1; i < row.length; i++) {
                        String h = clean(row[i]);
                        if (!h.isEmpty()) currentHeaders.add(h);
                    }
                }
                case "ROW" -> {
                    if (currentRows != null) {
                        List<String> dataRow = new ArrayList<>();
                        int cols = currentHeaders != null ? currentHeaders.size() : row.length - 1;
                        for (int i = 1; i <= cols && i < row.length; i++) {
                            dataRow.add(clean(row[i]));
                        }
                        // Pad if short
                        while (dataRow.size() < (currentHeaders != null ? currentHeaders.size() : 0)) {
                            dataRow.add("");
                        }
                        if (!dataRow.isEmpty()) currentRows.add(dataRow);
                    }
                }
            }
        }

        // Save last section
        if (currentTitle != null && currentHeaders != null) {
            sections.add(buildSection(exam, currentTitle, currentHeaders, currentRows, orderIdx));
        }

        if (sections.isEmpty()) throw new BadRequestException("No valid sections found in CSV");
        sectionRepo.saveAll(sections);

        log.info("Uploaded {} exam sections from CSV for exam {}", sections.size(), examId);
        return ResponseEntity.ok(Map.of("sectionsCreated", sections.size()));
    }

    @GetMapping("/admin/exam-info/template")
    public ResponseEntity<String> getExamInfoTemplate() {
        String csv = "type,col1,col2,col3,col4,col5\n" +
                "SECTION,Eligibility Criteria,,,,\n" +
                "HEADERS,Criterion,Details,,,\n" +
                "ROW,Age Limit,18-35 years,,,\n" +
                "ROW,Education,Graduate in Agriculture,,,\n" +
                "ROW,Nationality,Indian,,,\n" +
                "SECTION,Exam Pattern,,,,\n" +
                "HEADERS,Section,Questions,Marks,Duration,\n" +
                "ROW,General Knowledge,50,50,60 min,\n" +
                "ROW,Agriculture,100,100,120 min,\n" +
                "SECTION,Important Dates,,,,\n" +
                "HEADERS,Event,Date,,,\n" +
                "ROW,Notification Release,January 2025,,,\n" +
                "ROW,Application Start,February 2025,,,\n" +
                "ROW,Exam Date,April 2025,,,\n";
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=exam_info_template.csv")
                .header("Content-Type", "text/csv")
                .body(csv);
    }

    // ── Exam Info Doc Upload (PDF / DOCX) ────────────────────────────────────

    @PostMapping("/admin/exams/{examId}/sections/upload-doc")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadExamInfoDoc(
            @PathVariable Long examId,
            @RequestParam("file") MultipartFile file) throws Exception {

        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String rawText;

        if (filename.endsWith(".pdf")) {
            rawText = extractPdfText(file.getBytes());
        } else if (filename.endsWith(".docx")) {
            rawText = extractDocxText(file.getBytes());
        } else if (filename.endsWith(".doc")) {
            throw new BadRequestException("Old .doc format is not supported. Please save as .docx and re-upload.");
        } else if (filename.endsWith(".txt")) {
            rawText = new String(file.getBytes(), StandardCharsets.UTF_8);
        } else {
            throw new BadRequestException("Unsupported file type. Upload PDF, DOCX or TXT.");
        }

        if (rawText == null || rawText.isBlank()) {
            throw new BadRequestException("Could not extract any text from the uploaded file.");
        }

        // Convert raw text to beautiful HTML via AI
        log.info("Converting raw text to HTML for exam {} ({} chars)...", examId, rawText.length());
        String htmlContent = aiService.convertToHtml(rawText);

        // Delete existing DOC-type sections for this exam so re-upload replaces them
        sectionRepo.findByExamIdOrderByOrderIndex(examId).stream()
                .filter(s -> "DOC".equals(s.getSectionType()))
                .forEach(s -> sectionRepo.delete(s));

        // Store HTML content in description
        String docTitle = filename.replaceAll("\\.[a-zA-Z]+$", "").replace("_", " ").replace("-", " ");
        ExamSection section = ExamSection.builder()
                .exam(exam)
                .title(docTitle.isBlank() ? "Exam Information" : capitalize(docTitle))
                .description(htmlContent)
                .sectionType("DOC")
                .orderIndex(0)
                .build();
        sectionRepo.save(section);

        log.info("Uploaded exam info doc for exam {} — {} chars extracted", examId, rawText.length());
        return ResponseEntity.ok(Map.of("chars", rawText.length(), "message", "Document uploaded successfully"));
    }

    private String extractPdfText(byte[] bytes) throws Exception {
        try (org.apache.pdfbox.pdmodel.PDDocument doc =
                     org.apache.pdfbox.Loader.loadPDF(bytes)) {
            return new org.apache.pdfbox.text.PDFTextStripper().getText(doc);
        }
    }

    private String extractDocxText(byte[] bytes) throws Exception {
        try (java.io.InputStream is = new java.io.ByteArrayInputStream(bytes);
             org.apache.poi.xwpf.usermodel.XWPFDocument doc = new org.apache.poi.xwpf.usermodel.XWPFDocument(is)) {
            StringBuilder sb = new StringBuilder();
            for (org.apache.poi.xwpf.usermodel.XWPFParagraph p : doc.getParagraphs()) {
                sb.append(p.getText()).append("\n");
            }
            return sb.toString();
        }
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    // ── Mock Test Question CSV Upload ───────────────────────────────────────

    @PostMapping("/admin/mock-tests/{mockTestId}/upload-csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadMockTestCsv(
            @PathVariable Long mockTestId,
            @RequestParam("file") MultipartFile file) throws Exception {

        McqTest test = mcqTestRepo.findById(mockTestId)
                .orElseThrow(() -> new ResourceNotFoundException("MockTest", mockTestId));

        List<String[]> rows = parseCsv(file);
        if (rows.isEmpty()) throw new BadRequestException("CSV file is empty");

        // Delete existing questions before re-upload
        mcqQuestionRepo.deleteAll(mcqQuestionRepo.findByTestIdOrderByOrderIndexAsc(mockTestId));

        List<McqQuestion> questions = new ArrayList<>();
        int orderIdx = 0;
        for (String[] row : rows) {
            if (row.length < 6) continue;
            String question = clean(row[0]);
            if (question.isEmpty()) continue;

            McqQuestion q = McqQuestion.builder()
                    .test(test)
                    .question(question)
                    .optionA(clean(row[1]))
                    .optionB(clean(row[2]))
                    .optionC(clean(row[3]))
                    .optionD(clean(row[4]))
                    .correctOption(clean(row[5]).toUpperCase())
                    .explanation(row.length > 6 ? clean(row[6]) : null)
                    .orderIndex(orderIdx++)
                    .build();
            questions.add(q);
        }

        if (questions.isEmpty()) throw new BadRequestException("No valid questions found in CSV");

        mcqQuestionRepo.saveAll(questions);
        test.setTotalQuestions(questions.size());
        mcqTestRepo.save(test);

        log.info("Uploaded {} questions to mock test {}", questions.size(), mockTestId);
        return ResponseEntity.ok(Map.of(
                "testId", test.getId(),
                "questionsUploaded", questions.size()
        ));
    }

    private List<String[]> parseCsv(MultipartFile file) throws Exception {
        List<String[]> result = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; } // skip header
                if (line.trim().isEmpty()) continue;
                result.add(parseCsvLine(line));
            }
        }
        return result;
    }

    private String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    sb.append('"'); i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                fields.add(sb.toString()); sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        fields.add(sb.toString());
        return fields.toArray(new String[0]);
    }

    private String clean(String s) {
        return s == null ? "" : s.trim().replaceAll("^\"|\"$", "");
    }

    private ExamSection buildSection(Exam exam, String title, List<String> headers,
                                     List<List<String>> rows, int orderIdx) throws Exception {
        List<List<String>> safeRows = rows != null ? rows : new ArrayList<>();
        return ExamSection.builder()
                .exam(exam)
                .title(title)
                .sectionType("CUSTOM")
                .tableHeaders(objectMapper.writeValueAsString(headers))
                .tableRows(objectMapper.writeValueAsString(safeRows))
                .orderIndex(orderIdx)
                .build();
    }
}
