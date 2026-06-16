package com.agrilearn.dto.response;

import com.agrilearn.entity.Course;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder(toBuilder = true)
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String previewVideoUrl;
    private Course.Category category;
    private Course.Level level;
    private Course.Language language;
    private Course.Status status;
    private boolean free;
    private BigDecimal price;
    private Integer durationMinutes;
    private double rating;
    private int totalRatings;
    private int enrollmentCount;
    private int chapterCount;
    private int lessonCount;
    private UserResponse instructor;
    private List<ChapterResponse> chapters;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class ChapterResponse {
        private Long id;
        private String title;
        private String description;
        private int orderIndex;
        private List<LessonSummary> lessons;
    }

    @Data
    @Builder
    public static class LessonSummary {
        private Long id;
        private String title;
        private String type;
        private Integer durationMinutes;
        private boolean freePreview;
        private String videoUrl;
        private boolean hasVideo;
    }
}
