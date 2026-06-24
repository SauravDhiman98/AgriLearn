package com.agrilearn.repository;

import com.agrilearn.entity.ChapterVideo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChapterVideoRepository extends JpaRepository<ChapterVideo, Long> {
    List<ChapterVideo> findByChapterIdOrderByOrderIndexAsc(Long chapterId);
}
