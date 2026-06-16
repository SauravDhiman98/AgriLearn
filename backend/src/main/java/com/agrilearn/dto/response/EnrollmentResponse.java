package com.agrilearn.dto.response;

import com.agrilearn.entity.Enrollment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseThumbnailUrl;
    private String courseCategory;
    private int progressPercent;
    private boolean completed;
    private LocalDateTime completedAt;
    private LocalDateTime enrolledAt;
    private String certificateUrl;

    public static EnrollmentResponse from(Enrollment e) {
        return EnrollmentResponse.builder()
                .id(e.getId())
                .courseId(e.getCourse().getId())
                .courseTitle(e.getCourse().getTitle())
                .courseThumbnailUrl(e.getCourse().getThumbnailUrl())
                .courseCategory(e.getCourse().getCategory() != null ? e.getCourse().getCategory().name() : null)
                .progressPercent(e.getProgressPercent())
                .completed(e.isCompleted())
                .completedAt(e.getCompletedAt())
                .enrolledAt(e.getEnrolledAt())
                .certificateUrl(e.getCertificateUrl())
                .build();
    }
}
