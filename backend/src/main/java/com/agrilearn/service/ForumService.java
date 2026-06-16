package com.agrilearn.service;

import com.agrilearn.dto.response.ForumCommentResponse;
import com.agrilearn.dto.response.ForumPostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface ForumService {
    Page<ForumPostResponse> listPosts(String tag, String keyword, Pageable pageable);
    ForumPostResponse getPostById(Long id);
    ForumPostResponse createPost(Map<String, Object> body);
    ForumCommentResponse addComment(Long postId, String content);
    void upvotePost(Long postId);
    void acceptAnswer(Long commentId);
}
