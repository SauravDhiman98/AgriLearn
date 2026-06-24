package com.agrilearn.repository;

import com.agrilearn.entity.McqAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface McqAttemptRepository extends JpaRepository<McqAttempt, Long> {
    List<McqAttempt> findByUserIdAndTestIdOrderByCompletedAtDesc(Long userId, Long testId);
    List<McqAttempt> findByUserIdOrderByCompletedAtDesc(Long userId);
}
