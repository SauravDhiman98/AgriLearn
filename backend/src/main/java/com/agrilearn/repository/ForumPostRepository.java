package com.agrilearn.repository;

import com.agrilearn.entity.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    Page<ForumPost> findByAuthorId(Long authorId, Pageable pageable);

    @Query("SELECT p FROM ForumPost p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ForumPost> searchPosts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM ForumPost p JOIN p.tags t WHERE t = :tag")
    Page<ForumPost> findByTag(@Param("tag") String tag, Pageable pageable);
}
