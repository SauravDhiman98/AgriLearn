package com.agrilearn.controller;

import com.agrilearn.dto.response.CourseResponse;
import com.agrilearn.entity.Course;
import com.agrilearn.repository.*;
import com.agrilearn.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ── Stats overview ────────────────────────────────────────────────
    @GetMapping("/stats")
    @Operation(summary = "Get platform statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers       = userRepository.count();
        long totalCourses     = courseRepository.count();
        long totalEnrolls     = enrollmentRepository.count();
        long publishedCourses = courseRepository.countByStatus(Course.Status.PUBLISHED);

        return ResponseEntity.ok(Map.of(
            "totalUsers",       totalUsers,
            "totalCourses",     totalCourses,
            "publishedCourses", publishedCourses,
            "totalEnrollments", totalEnrolls
        ));
    }

    // ── All courses (including drafts) — single DB query, no N+1 ─────
    @GetMapping("/courses")
    @Operation(summary = "List all courses (admin — includes drafts)")
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(courseService.listAllCourses(PageRequest.of(page, size)));
    }
}
