package com.agrilearn.repository;

import com.agrilearn.entity.LiveClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LiveClassRepository extends JpaRepository<LiveClass, Long> {

    Page<LiveClass> findByStatus(LiveClass.LiveClassStatus status, Pageable pageable);

    @Query("SELECT l FROM LiveClass l WHERE l.scheduledAt >= :from AND l.scheduledAt <= :to ORDER BY l.scheduledAt ASC")
    List<LiveClass> findUpcomingClasses(LocalDateTime from, LocalDateTime to);

    List<LiveClass> findByInstructorId(Long instructorId);
}
