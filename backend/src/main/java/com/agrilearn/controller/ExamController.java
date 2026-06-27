package com.agrilearn.controller;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.entity.McqAttempt;
import com.agrilearn.entity.User;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.McqAttemptRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.security.UserPrincipal;
import com.agrilearn.service.ExamService;
import com.agrilearn.service.McqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final McqService mcqService;
    private final McqAttemptRepository mcqAttemptRepository;
    private final UserRepository userRepository;

    @GetMapping("/exams")
    public ResponseEntity<List<ExamDto.ExamResponse>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<ExamDto.ExamDetailResponse> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping("/exams/{examId}/sections")
    public ResponseEntity<List<ExamDto.SectionResponse>> getSections(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getSectionsByExam(examId));
    }

    @GetMapping("/subjects/{id}")
    public ResponseEntity<ExamDto.SubjectDetailResponse> getSubject(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getSubjectById(id));
    }

    @GetMapping("/exam-chapters/{id}")
    public ResponseEntity<ExamDto.ChapterDetailResponse> getChapter(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getChapterById(id));
    }

    @GetMapping("/mcq-tests/{id}")
    public ResponseEntity<ExamDto.McqTestDetailResponse> getTest(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean withAnswers) {
        return ResponseEntity.ok(mcqService.getTestWithQuestions(id, withAnswers));
    }

    @PostMapping("/mcq-tests/{id}/submit")
    public ResponseEntity<ExamDto.McqAttemptResponse> submitAttempt(
            @PathVariable Long id,
            @RequestBody ExamDto.McqAttemptRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        req.setTestId(id);
        return ResponseEntity.ok(mcqService.submitAttempt(principal.getId(), req));
    }

    @GetMapping("/mcq-tests/{id}/attempts")
    public ResponseEntity<List<ExamDto.McqAttemptResponse>> getAttempts(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(mcqService.getUserAttempts(principal.getId(), id));
    }

    @GetMapping("/me/attempts/recent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getRecentAttempts() {
        User user = getCurrentUser();
        List<Map<String, Object>> attempts = mcqAttemptRepository.findByUserIdOrderByCompletedAtDesc(user.getId()).stream()
                .limit(5)
                .map(attempt -> Map.<String, Object>of(
                        "id", attempt.getId(),
                        "testId", attempt.getTest().getId(),
                        "testTitle", attempt.getTest().getTitle(),
                        "score", attempt.getScore(),
                        "netScore", attempt.getNetScore(),
                        "totalQuestions", attempt.getTotalQuestions(),
                        "timeTakenSeconds", attempt.getTimeTakenSeconds(),
                        "completedAt", attempt.getCompletedAt()
                ))
                .toList();
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/exams/{examId}/mock-tests")
    public ResponseEntity<List<ExamDto.McqTestResponse>> getExamMockTests(@PathVariable Long examId) {
        return ResponseEntity.ok(mcqService.listExamMockTests(examId));
    }

    @GetMapping("/mock-tests/{testId}/leaderboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard(@PathVariable Long testId) {
        List<McqAttempt> attempts = mcqAttemptRepository.findTop20ByTestIdOrderByNetScoreDescTimeTakenSecondsAsc(testId);
        List<Map<String, Object>> rows = new java.util.ArrayList<>();
        for (int i = 0; i < attempts.size(); i++) {
            McqAttempt attempt = attempts.get(i);
            String name = ((attempt.getUser().getFirstName() == null ? "" : attempt.getUser().getFirstName()) + " " +
                    (attempt.getUser().getLastName() == null ? "" : attempt.getUser().getLastName())).trim();
            if (name.isBlank()) {
                name = attempt.getUser().getEmail();
            }
            rows.add(Map.of(
                    "rank", i + 1,
                    "studentName", name,
                    "score", attempt.getNetScore(),
                    "timeTakenSeconds", attempt.getTimeTakenSeconds()
            ));
        }
        return ResponseEntity.ok(rows);
    }

    @PostMapping("/admin/exams/{examId}/mock-tests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.McqTestResponse> createMockTest(
            @PathVariable Long examId,
            @RequestBody ExamDto.CreateMockTestRequest req) {
        return ResponseEntity.ok(mcqService.createExamMockTest(examId, req));
    }

    @DeleteMapping("/admin/mcq-tests/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMockTest(@PathVariable Long id) {
        examService.deleteMockTest(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/exams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.ExamResponse> createExam(@RequestBody ExamDto.CreateExamRequest req) {
        return ResponseEntity.ok(examService.createExam(req));
    }

    @PutMapping("/admin/exams/{examId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.ExamResponse> updateExam(
            @PathVariable Long examId,
            @RequestBody ExamDto.CreateExamRequest req) {
        return ResponseEntity.ok(examService.updateExam(examId, req));
    }

    @PostMapping("/admin/exams/{examId}/sections")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.SectionResponse> createSection(
            @PathVariable Long examId,
            @RequestBody ExamDto.CreateSectionRequest req) {
        return ResponseEntity.ok(examService.createSection(examId, req));
    }

    @PutMapping("/admin/sections/{sectionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.SectionResponse> updateSection(
            @PathVariable Long sectionId,
            @RequestBody ExamDto.CreateSectionRequest req) {
        return ResponseEntity.ok(examService.updateSection(sectionId, req));
    }

    @DeleteMapping("/admin/sections/{sectionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSection(@PathVariable Long sectionId) {
        examService.deleteSection(sectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/exams/{examId}/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.SubjectResponse> createSubject(
            @PathVariable Long examId, @RequestBody ExamDto.CreateSubjectRequest req) {
        return ResponseEntity.ok(examService.createSubject(examId, req));
    }

    @PostMapping("/admin/subjects/{subjectId}/chapters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.ChapterResponse> createChapter(
            @PathVariable Long subjectId, @RequestBody ExamDto.CreateChapterRequest req) {
        return ResponseEntity.ok(examService.createChapter(subjectId, req));
    }

    @PostMapping("/admin/chapters/{chapterId}/notes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.NotesResponse> createNotes(
            @PathVariable Long chapterId, @RequestBody ExamDto.CreateNotesRequest req) {
        return ResponseEntity.ok(examService.createNotes(chapterId, req));
    }

    @PutMapping("/admin/notes/{notesId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.NotesResponse> updateNotes(
            @PathVariable Long notesId, @RequestBody ExamDto.CreateNotesRequest req) {
        return ResponseEntity.ok(examService.updateNotes(notesId, req));
    }

    @PostMapping("/admin/chapters/{chapterId}/videos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.VideoResponse> createVideo(
            @PathVariable Long chapterId, @RequestBody ExamDto.CreateVideoRequest req) {
        return ResponseEntity.ok(examService.createVideo(chapterId, req));
    }

    @PostMapping("/admin/notes/{notesId}/generate-mcq")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.McqTestResponse> generateMcq(
            @PathVariable Long notesId,
            @RequestParam(defaultValue = "10") int questionCount,
            @RequestParam Long chapterId) {
        return ResponseEntity.ok(mcqService.generateAiMcq(notesId, questionCount, chapterId));
    }

    @DeleteMapping("/admin/notes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNotes(@PathVariable Long id) {
        examService.deleteNotes(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/videos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        examService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
