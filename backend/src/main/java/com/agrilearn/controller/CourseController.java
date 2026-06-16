package com.agrilearn.controller;

import com.agrilearn.dto.request.CreateCourseRequest;
import com.agrilearn.dto.response.CourseResponse;
import com.agrilearn.dto.response.EnrollmentResponse;
import com.agrilearn.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course catalog, enrollment, and progress tracking")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "List published courses with optional filters")
    public ResponseEntity<Page<CourseResponse>> listCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(courseService.listCourses(category, language, keyword, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course details")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured/top-rated courses")
    public ResponseEntity<List<CourseResponse>> getFeatured() {
        return ResponseEntity.ok(courseService.getFeaturedCourses());
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Enroll in a course")
    public ResponseEntity<String> enroll(@PathVariable Long id) {
        courseService.enrollUser(id);
        return ResponseEntity.ok("Enrolled successfully");
    }

    @GetMapping("/{id}/progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get course progress for current user")
    public ResponseEntity<?> getProgress(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getUserProgress(id));
    }

    @PostMapping("/{courseId}/lessons/{lessonId}/complete")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark a lesson as completed")
    public ResponseEntity<String> completeLesson(@PathVariable Long courseId, @PathVariable Long lessonId) {
        courseService.completeLesson(courseId, lessonId);
        return ResponseEntity.ok("Lesson marked as completed");
    }

    @PostMapping("/{id}/rate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Rate a course (1-5 stars)")
    public ResponseEntity<String> rateCourse(@PathVariable Long id, @RequestParam int rating) {
        courseService.rateCourse(id, rating);
        return ResponseEntity.ok("Rating submitted");
    }

    @GetMapping("/my-courses")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get enrolled courses for current user")
    public ResponseEntity<List<CourseResponse>> getMyCourses() {
        return ResponseEntity.ok(courseService.getMyCourses());
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get enrollments with progress for current user")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments() {
        return ResponseEntity.ok(courseService.getMyEnrollments());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Create a new course (instructor/admin only)")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request));
    }
}
