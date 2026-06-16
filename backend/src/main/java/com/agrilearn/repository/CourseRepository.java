package com.agrilearn.repository;

import com.agrilearn.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Page<Course> findByStatus(Course.Status status, Pageable pageable);

    long countByStatus(Course.Status status);

    Page<Course> findByStatusAndCategory(Course.Status status, Course.Category category, Pageable pageable);

    Page<Course> findByStatusAndLanguage(Course.Status status, Course.Language language, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Course> searchCourses(@Param("keyword") String keyword, Pageable pageable);

    List<Course> findByInstructorId(Long instructorId);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' ORDER BY c.rating DESC")
    List<Course> findTopRatedCourses(Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' ORDER BY c.createdAt DESC")
    List<Course> findLatestCourses(Pageable pageable);
}
