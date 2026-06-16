package com.agrilearn.dto.response;

import com.agrilearn.entity.LiveClass;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LiveClassResponse {
    private Long id;
    private String title;
    private String description;
    private UserResponse instructor;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime scheduledAt;
    private int durationMinutes;
    private String meetingUrl;
    private LiveClass.LiveClassStatus status;
    private boolean premiumOnly;
    private int registeredCount;
    private LocalDateTime createdAt;

    public static LiveClassResponse from(LiveClass lc) {
        return LiveClassResponse.builder()
                .id(lc.getId())
                .title(lc.getTitle())
                .description(lc.getDescription())
                .instructor(lc.getInstructor() != null ? UserResponse.from(lc.getInstructor()) : null)
                .courseId(lc.getCourse() != null ? lc.getCourse().getId() : null)
                .courseTitle(lc.getCourse() != null ? lc.getCourse().getTitle() : null)
                .scheduledAt(lc.getScheduledAt())
                .durationMinutes(lc.getDurationMinutes())
                .meetingUrl(lc.getMeetingUrl())
                .status(lc.getStatus())
                .premiumOnly(lc.isPremiumOnly())
                .registeredCount(lc.getRegisteredCount())
                .createdAt(lc.getCreatedAt())
                .build();
    }
}
