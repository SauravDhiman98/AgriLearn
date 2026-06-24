package com.agrilearn.repository;

import com.agrilearn.entity.McqQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface McqQuestionRepository extends JpaRepository<McqQuestion, Long> {
    List<McqQuestion> findByTestIdOrderByOrderIndexAsc(Long testId);
}
