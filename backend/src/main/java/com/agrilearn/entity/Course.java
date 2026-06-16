package com.agrilearn.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String thumbnailUrl;
    private String previewVideoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private boolean free = true;

    private BigDecimal price;

    private Integer durationMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Enrollment> enrollments = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private double rating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private int totalRatings = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Category {
        CROP_SCIENCE, SOIL_HEALTH, IRRIGATION, ORGANIC_FARMING,
        PEST_MANAGEMENT, HORTICULTURE, ANIMAL_HUSBANDRY, AGRIBUSINESS,
        FARM_TECHNOLOGY, FOOD_PROCESSING, DAIRY_FARMING, AQUACULTURE
    }

    public enum Level {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public enum Language {
        ENGLISH, HINDI, MARATHI, PUNJABI, GUJARATI, KANNADA,
        TAMIL, TELUGU, BENGALI, ODIA, MALAYALAM
    }

    public enum Status {
        DRAFT, UNDER_REVIEW, PUBLISHED, ARCHIVED
    }
}
