package com.agrilearn.repository;

import com.agrilearn.entity.SubjectChapter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectChapterRepository extends JpaRepository<SubjectChapter, Long> {
    List<SubjectChapter> findBySubjectIdOrderByOrderIndexAsc(Long subjectId);
}
