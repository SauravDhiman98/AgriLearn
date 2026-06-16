package com.agrilearn.controller;

import com.agrilearn.entity.Enrollment;
import com.agrilearn.entity.Lesson;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.EnrollmentRepository;
import com.agrilearn.repository.LessonRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.MinioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/videos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Videos", description = "Video upload and streaming")
public class VideoController {

    private final MinioService minioService;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Value("${minio.bucket.videos}")
    private String videosBucket;

    @Value("${minio.bucket.thumbnails}")
    private String thumbnailsBucket;

    // ── allowed video types ──────────────────────────────────────────────
    private static final List<String> ALLOWED_VIDEO_TYPES = List.of(
            "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"
    );
    private static final long MAX_VIDEO_SIZE = 500L * 1024 * 1024; // 500 MB

    // ─────────────────────────────────────────────────────────────────────
    // INSTRUCTOR: Upload video for a lesson
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/lessons/{lessonId}/upload")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Upload video for a lesson (instructor/admin only)")
    public ResponseEntity<Map<String, Object>> uploadVideo(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file) {

        // Validate
        if (file.isEmpty()) throw new BadRequestException("File is empty");
        if (file.getSize() > MAX_VIDEO_SIZE)
            throw new BadRequestException("File too large. Max size is 500 MB.");
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_VIDEO_TYPES.contains(contentType))
            throw new BadRequestException("Invalid video format. Allowed: MP4, WebM, OGG, MOV, AVI");

        // Verify lesson exists
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + lessonId));

        // Build object name: lessons/<lessonId>/<uuid>.<ext>
        String ext = getExtension(file.getOriginalFilename(), contentType);
        String objectName = "lessons/" + lessonId + "/" + UUID.randomUUID() + "." + ext;

        // Delete old video if exists
        if (lesson.getVideoUrl() != null && !lesson.getVideoUrl().isBlank()) {
            try { minioService.deleteFile(videosBucket, lesson.getVideoUrl()); } catch (Exception ignored) {}
        }

        // Upload
        String stored = minioService.uploadFile(file, videosBucket, objectName);
        lesson.setVideoUrl(stored);
        lesson.setType(Lesson.LessonType.VIDEO);
        lessonRepository.save(lesson);

        log.info("Video uploaded for lesson id={} — object='{}'", lessonId, objectName);
        return ResponseEntity.ok(Map.of(
                "lessonId", lessonId,
                "objectName", objectName,
                "size", file.getSize(),
                "contentType", contentType,
                "message", "Video uploaded successfully"
        ));
    }

    // ─────────────────────────────────────────────────────────────────────
    // STUDENT: Get pre-signed URL to watch a lesson video (1 hour TTL)
    // ─────────────────────────────────────────────────────────────────────
    @GetMapping("/lessons/{lessonId}/stream")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get pre-signed video URL for a lesson (enrolled students only)")
    public ResponseEntity<Map<String, Object>> getVideoUrl(@PathVariable Long lessonId) {

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + lessonId));

        if (lesson.getVideoUrl() == null || lesson.getVideoUrl().isBlank())
            throw new ResourceNotFoundException("No video available for this lesson yet.");

        // Free preview — no enrollment check needed
        if (!lesson.isFreePreview()) {
            // Verify the user is enrolled in the course
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Long courseId = lesson.getChapter().getCourse().getId();
            boolean enrolled = enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), courseId);
            if (!enrolled)
                throw new BadRequestException("You must be enrolled to watch this lesson.");
        }

        // Generate 1-hour pre-signed URL
        String url = minioService.getPresignedUrl(videosBucket, lesson.getVideoUrl(), 3600);

        return ResponseEntity.ok(Map.of(
                "url", url,
                "lessonId", lessonId,
                "title", lesson.getTitle(),
                "durationMinutes", lesson.getDurationMinutes() != null ? lesson.getDurationMinutes() : 0,
                "expiresInSeconds", 3600
        ));
    }

    // ─────────────────────────────────────────────────────────────────────
    // INSTRUCTOR: Upload course thumbnail
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/courses/{courseId}/thumbnail")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Upload thumbnail for a course")
    public ResponseEntity<Map<String, String>> uploadThumbnail(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) throw new BadRequestException("File is empty");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            throw new BadRequestException("File must be an image (JPEG, PNG, WebP)");
        if (file.getSize() > 5L * 1024 * 1024)
            throw new BadRequestException("Image too large. Max 5 MB.");

        String ext = getExtension(file.getOriginalFilename(), contentType);
        String objectName = "courses/" + courseId + "/thumbnail-" + UUID.randomUUID() + "." + ext;
        minioService.uploadFile(file, thumbnailsBucket, objectName);

        // Return a pre-signed URL valid for 24h as the thumbnail URL
        String url = minioService.getPresignedUrl(thumbnailsBucket, objectName, 86400);
        log.info("Thumbnail uploaded for course id={} — object='{}'", courseId, objectName);
        return ResponseEntity.ok(Map.of("thumbnailUrl", url, "objectName", objectName));
    }

    // ─────────────────────────────────────────────────────────────────────
    // INSTRUCTOR: Delete video from a lesson
    // ─────────────────────────────────────────────────────────────────────
    @DeleteMapping("/lessons/{lessonId}/video")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Delete video from a lesson")
    public ResponseEntity<Map<String, String>> deleteVideo(@PathVariable Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + lessonId));
        if (lesson.getVideoUrl() != null) {
            minioService.deleteFile(videosBucket, lesson.getVideoUrl());
            lesson.setVideoUrl(null);
            lessonRepository.save(lesson);
        }
        return ResponseEntity.ok(Map.of("message", "Video deleted"));
    }

    // ─────────────────────────────────────────────────────────────────────
    private String getExtension(String filename, String contentType) {
        if (filename != null && filename.contains("."))
            return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return switch (contentType) {
            case "video/mp4"       -> "mp4";
            case "video/webm"      -> "webm";
            case "video/ogg"       -> "ogv";
            case "video/quicktime" -> "mov";
            case "image/jpeg"      -> "jpg";
            case "image/png"       -> "png";
            case "image/webp"      -> "webp";
            default                -> "bin";
        };
    }
}
