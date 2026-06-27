package com.agrilearn.repository;

import com.agrilearn.entity.McqTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface McqTestRepository extends JpaRepository<McqTest, Long> {
    List<McqTest> findByChapterIdOrderByCreatedAtDesc(Long chapterId);
    List<McqTest> findByExamIdOrderByCreatedAtDesc(Long examId);
}
