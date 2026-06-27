package com.agrilearn.repository;

import com.agrilearn.entity.McqAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface McqAttemptRepository extends JpaRepository<McqAttempt, Long> {
    interface TestAttemptSummary {
        Long getId();
        String getTitle();
        long getAttempts();
    }

    List<McqAttempt> findByUserIdAndTestIdOrderByCompletedAtDesc(Long userId, Long testId);
    List<McqAttempt> findByUserIdOrderByCompletedAtDesc(Long userId);
    List<McqAttempt> findTop20ByTestIdOrderByNetScoreDescTimeTakenSecondsAsc(Long testId);
    long countByCompletedAtAfter(LocalDateTime completedAt);
    long countByUserId(Long userId);

    @Query("""
            select coalesce(avg(case
                when a.totalQuestions = 0 then 0
                else (a.score * 100.0 / a.totalQuestions)
            end), 0)
            from McqAttempt a
            """)
    Double findAverageScorePercentage();

    @Query("""
            select t.id as id, t.title as title, count(a.id) as attempts
            from McqAttempt a
            join a.test t
            group by t.id, t.title
            order by count(a.id) desc
            """)
    List<TestAttemptSummary> findTopTestsByAttemptCount(Pageable pageable);
}
