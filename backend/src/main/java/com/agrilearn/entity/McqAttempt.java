package com.agrilearn.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "mcq_attempts")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McqAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private McqTest test;

    @Column(nullable = false)
    @Builder.Default
    private int score = 0;

    @Column(nullable = false)
    private int totalQuestions;

    @Column(columnDefinition = "TEXT")
    private String answers;

    @Column(nullable = false)
    @Builder.Default
    private int timeTakenSeconds = 0;

    @Column(nullable = false)
    @Builder.Default
    private double netScore = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime completedAt;
}
