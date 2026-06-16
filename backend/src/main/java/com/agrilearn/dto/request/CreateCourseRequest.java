package com.agrilearn.dto.request;

import com.agrilearn.entity.Course;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateCourseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String thumbnailUrl;
    private String previewVideoUrl;

    @NotNull(message = "Category is required")
    private Course.Category category;

    @NotNull(message = "Level is required")
    private Course.Level level;

    @NotNull(message = "Language is required")
    private Course.Language language;

    private boolean free = true;
    private BigDecimal price;
    private Integer durationMinutes;
}
