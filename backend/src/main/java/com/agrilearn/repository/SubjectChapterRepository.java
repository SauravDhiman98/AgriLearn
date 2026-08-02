package com.agrilearn.repository;

import com.agrilearn.entity.SubjectChapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SubjectChapterRepository extends JpaRepository<SubjectChapter, Long> {
    List<SubjectChapter> findBySubjectIdOrderByOrderIndexAsc(Long subjectId);
    List<SubjectChapter> findTop10ByTitleContainingIgnoreCaseOrderByTitleAsc(String q);
    Optional<SubjectChapter> findBySubjectIdAndTitleIgnoreCase(Long subjectId, String title);

    @Query("SELECT COUNT(c) FROM SubjectChapter c WHERE c.subject.id = :subjectId")
    int countBySubjectId(Long subjectId);
}
