package com.agrilearn.repository;

import com.agrilearn.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByActiveTrueOrderByNameAsc();
    Optional<Exam> findBySlug(String slug);
}
