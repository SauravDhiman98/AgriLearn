package com.agrilearn.controller;

import com.agrilearn.entity.Quiz;
import com.agrilearn.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Course quiz management and submission")
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/course/{courseId}")
    @Operation(summary = "List all quizzes for a course")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a quiz with questions (correct answers hidden)")
    public ResponseEntity<Map<String, Object>> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit quiz answers and receive score")
    public ResponseEntity<Map<String, Object>> submitQuiz(
            @PathVariable Long id,
            @RequestBody Map<String, Long> rawAnswers) {
        // Convert String keys to Long question IDs
        Map<Long, Long> answers = new java.util.HashMap<>();
        rawAnswers.forEach((k, v) -> {
            try { answers.put(Long.parseLong(k), v); }
            catch (NumberFormatException ignored) {}
        });
        return ResponseEntity.ok(quizService.submitQuiz(id, answers));
    }
}
