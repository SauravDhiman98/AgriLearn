package com.agrilearn.repository;

import com.agrilearn.entity.ChapterNotes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChapterNotesRepository extends JpaRepository<ChapterNotes, Long> {
    List<ChapterNotes> findByChapterIdOrderByOrderIndexAsc(Long chapterId);
    List<ChapterNotes> findTop10ByTitleContainingIgnoreCaseOrderByTitleAsc(String q);
}
