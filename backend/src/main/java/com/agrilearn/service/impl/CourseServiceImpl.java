package com.agrilearn.service.impl;

import com.agrilearn.dto.request.CreateCourseRequest;
import com.agrilearn.dto.response.CourseResponse;
import com.agrilearn.dto.response.EnrollmentResponse;
import com.agrilearn.dto.response.UserResponse;
import com.agrilearn.entity.Course;
import com.agrilearn.entity.Enrollment;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.CourseRepository;
import com.agrilearn.repository.EnrollmentRepository;
import com.agrilearn.repository.LessonRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<CourseResponse> listCourses(String category, String language, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return courseRepository.searchCourses(keyword, pageable).map(this::toResponse);
        }
        if (category != null && !category.isBlank()) {
            try {
                return courseRepository.findByStatusAndCategory(
                        Course.Status.PUBLISHED,
                        Course.Category.valueOf(category.toUpperCase()),
                        pageable
                ).map(this::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }
        if (language != null && !language.isBlank()) {
            try {
                return courseRepository.findByStatusAndLanguage(
                        Course.Status.PUBLISHED,
                        Course.Language.valueOf(language.toUpperCase()),
                        pageable
                ).map(this::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }
        return courseRepository.findByStatus(Course.Status.PUBLISHED, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseResponse> listAllCourses(Pageable pageable) {
        return courseRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", id));
        return toDetailResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getFeaturedCourses() {
        return courseRepository.findTopRatedCourses(PageRequest.of(0, 8))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void enrollUser(Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));

        if (course.getStatus() != Course.Status.PUBLISHED) {
            throw new BadRequestException("Course is not available for enrollment");
        }
        if (enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), courseId)) {
            throw new BadRequestException("Already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(user)
                .course(course)
                .build();
        enrollmentRepository.save(enrollment);
        log.info("User '{}' enrolled in course '{}' (id={})", email, course.getTitle(), courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserProgress(Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var enrollment = enrollmentRepository.findByStudentIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new BadRequestException("Not enrolled in this course"));
        return Map.of(
                "courseId", courseId,
                "progressPercent", enrollment.getProgressPercent(),
                "completedLessons", enrollment.getCompletedLessonIds().size(),
                "completed", enrollment.isCompleted(),
                "enrolledAt", enrollment.getEnrolledAt()
        );
    }

    @Override
    public void completeLesson(Long courseId, Long lessonId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var enrollment = enrollmentRepository.findByStudentIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new BadRequestException("Not enrolled in this course"));

        // Verify lesson belongs to this course
        lessonRepository.findByIdAndChapterCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson " + lessonId + " not found in course " + courseId));

        // Add lesson to completed set (idempotent — adding same ID again is a no-op)
        enrollment.getCompletedLessonIds().add(lessonId);

        // Recalculate progress
        long totalLessons = lessonRepository.countByCourseId(courseId);
        if (totalLessons > 0) {
            int progress = (int) Math.round((enrollment.getCompletedLessonIds().size() * 100.0) / totalLessons);
            enrollment.setProgressPercent(Math.min(progress, 100));
        }

        if (enrollment.getProgressPercent() >= 100 && !enrollment.isCompleted()) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            log.info("User '{}' completed course id={} 🎉", email, courseId);
        }

        enrollmentRepository.save(enrollment);
        log.debug("User '{}' completed lesson id={} in course id={} — progress={}%",
                email, lessonId, courseId, enrollment.getProgressPercent());
    }

    @Override
    public void rateCourse(Long courseId, int rating) {
        if (rating < 1 || rating > 5) throw new BadRequestException("Rating must be between 1 and 5");

        // Verify user is enrolled
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), courseId)) {
            throw new BadRequestException("You must be enrolled to rate this course");
        }

        var course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        double newRating = ((course.getRating() * course.getTotalRatings()) + rating) / (course.getTotalRatings() + 1);
        course.setRating(Math.round(newRating * 10.0) / 10.0);
        course.setTotalRatings(course.getTotalRatings() + 1);
        courseRepository.save(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return enrollmentRepository.findByStudentId(user.getId())
                .stream()
                .map(e -> toResponse(e.getCourse()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return enrollmentRepository.findByStudentId(user.getId())
                .stream()
                .map(EnrollmentResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public CourseResponse createCourse(CreateCourseRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!request.isFree() && (request.getPrice() == null || request.getPrice().doubleValue() <= 0)) {
            throw new BadRequestException("Paid courses must have a price greater than 0");
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .previewVideoUrl(request.getPreviewVideoUrl())
                .category(request.getCategory())
                .level(request.getLevel())
                .language(request.getLanguage())
                .free(request.isFree())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .instructor(instructor)
                .status(Course.Status.DRAFT)
                .build();

        CourseResponse response = toResponse(courseRepository.save(course));
        log.info("New course created: '{}' (id={}) by instructor '{}' [{}]",
                course.getTitle(), response.getId(), email, course.getCategory());
        return response;
    }

    // ── Mappers ───────────────────────────────────────────────────────────────
    private CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .thumbnailUrl(c.getThumbnailUrl())
                .category(c.getCategory())
                .level(c.getLevel())
                .language(c.getLanguage())
                .status(c.getStatus())
                .free(c.isFree())
                .price(c.getPrice())
                .durationMinutes(c.getDurationMinutes())
                .rating(c.getRating())
                .totalRatings(c.getTotalRatings())
                .enrollmentCount((int) enrollmentRepository.countByCourseId(c.getId()))
                .chapterCount(c.getChapters().size())
                .instructor(c.getInstructor() != null ? UserResponse.from(c.getInstructor()) : null)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private CourseResponse toDetailResponse(Course c) {
        var chapters = c.getChapters().stream().map(ch ->
                CourseResponse.ChapterResponse.builder()
                        .id(ch.getId())
                        .title(ch.getTitle())
                        .description(ch.getDescription())
                        .orderIndex(ch.getOrderIndex())
                        .lessons(ch.getLessons().stream().map(l ->
                                CourseResponse.LessonSummary.builder()
                                        .id(l.getId())
                                        .title(l.getTitle())
                                        .type(l.getType().name())
                                        .durationMinutes(l.getDurationMinutes())
                                        .freePreview(l.isFreePreview())
                                        .videoUrl(l.getVideoUrl())
                                        .hasVideo(l.getVideoUrl() != null && !l.getVideoUrl().isBlank())
                                        .build()
                        ).collect(Collectors.toList()))
                        .build()
        ).collect(Collectors.toList());

        return toResponse(c).toBuilder()
                .chapters(chapters)
                .lessonCount(chapters.stream().mapToInt(ch -> ch.getLessons().size()).sum())
                .build();
    }
}
