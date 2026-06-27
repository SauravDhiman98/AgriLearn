package com.agrilearn.repository;

import com.agrilearn.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByActiveTrueOrderByNameAsc();
    List<Exam> findByNameContainingIgnoreCase(String q);
    @Query("""
            select e from Exam e
            where lower(e.name) like lower(concat('%', ?1, '%'))
               or lower(coalesce(e.description, '')) like lower(concat('%', ?1, '%'))
            order by e.name asc
            """)
    List<Exam> searchByKeyword(String q);
    Optional<Exam> findBySlug(String slug);
}
