package com.agrilearn.repository;

import com.agrilearn.entity.ExamSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamSectionRepository extends JpaRepository<ExamSection, Long> {
    List<ExamSection> findByExamIdOrderByOrderIndex(Long examId);
}
