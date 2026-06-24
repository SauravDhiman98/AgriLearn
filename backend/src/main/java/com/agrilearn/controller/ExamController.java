package com.agrilearn.controller;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.security.UserPrincipal;
import com.agrilearn.service.ExamService;
import com.agrilearn.service.McqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final McqService mcqService;

    @GetMapping("/exams")
    public ResponseEntity<List<ExamDto.ExamResponse>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<ExamDto.ExamDetailResponse> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
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

    @PostMapping("/admin/exams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.ExamResponse> createExam(@RequestBody ExamDto.CreateExamRequest req) {
        return ResponseEntity.ok(examService.createExam(req));
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
}
