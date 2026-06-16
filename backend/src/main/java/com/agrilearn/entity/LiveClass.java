package com.agrilearn.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "live_classes")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LiveClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private int durationMinutes;

    private String meetingUrl;
    private String meetingId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LiveClassStatus status = LiveClassStatus.SCHEDULED;

    @Builder.Default
    private boolean premiumOnly = false;

    @Builder.Default
    private int registeredCount = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum LiveClassStatus {
        SCHEDULED, LIVE, COMPLETED, CANCELLED
    }
}
