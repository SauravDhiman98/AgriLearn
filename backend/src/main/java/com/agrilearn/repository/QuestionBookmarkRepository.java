package com.agrilearn.repository;

import com.agrilearn.entity.QuestionBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuestionBookmarkRepository extends JpaRepository<QuestionBookmark, Long> {
    List<QuestionBookmark> findByUserId(Long userId);
    Optional<QuestionBookmark> findByUserIdAndQuestionId(Long userId, Long questionId);
    boolean existsByUserIdAndQuestionId(Long userId, Long questionId);
    void deleteByUserIdAndQuestionId(Long userId, Long questionId);
}
