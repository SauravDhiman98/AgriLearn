package com.agrilearn.repository;

import com.agrilearn.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    Optional<Lesson> findByIdAndChapterCourseId(Long lessonId, Long courseId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.chapter.course.id = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT l FROM Lesson l WHERE l.chapter.course.id = :courseId ORDER BY l.chapter.orderIndex, l.orderIndex")
    List<Lesson> findAllByCourseIdOrdered(@Param("courseId") Long courseId);
}
