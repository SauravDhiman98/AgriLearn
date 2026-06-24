package com.agrilearn.repository;

import com.agrilearn.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamSubjectRepository extends JpaRepository<ExamSubject, Long> {
    List<ExamSubject> findByExamIdOrderByOrderIndexAsc(Long examId);
}
