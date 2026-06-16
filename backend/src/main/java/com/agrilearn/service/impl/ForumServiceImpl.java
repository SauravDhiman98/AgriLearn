package com.agrilearn.service.impl;

import com.agrilearn.dto.response.ForumCommentResponse;
import com.agrilearn.dto.response.ForumPostResponse;
import com.agrilearn.entity.ForumComment;
import com.agrilearn.entity.ForumPost;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.ForumCommentRepository;
import com.agrilearn.repository.ForumPostRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.ForumService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ForumServiceImpl implements ForumService {

    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ForumPostResponse> listPosts(String tag, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return forumPostRepository.searchPosts(keyword, pageable).map(ForumPostResponse::fromSummary);
        }
        if (tag != null && !tag.isBlank()) {
            return forumPostRepository.findByTag(tag, pageable).map(ForumPostResponse::fromSummary);
        }
        return forumPostRepository.findAll(pageable).map(ForumPostResponse::fromSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public ForumPostResponse getPostById(Long id) {
        ForumPost post = forumPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forum post", id));
        // Increment view count
        post.setViewCount(post.getViewCount() + 1);
        forumPostRepository.save(post);
        return ForumPostResponse.fromDetail(post);
    }

    @Override
    public ForumPostResponse createPost(Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var author = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String title = (String) body.get("title");
        String content = (String) body.get("content");
        if (title == null || title.isBlank()) throw new BadRequestException("Title is required");
        if (content == null || content.isBlank()) throw new BadRequestException("Content is required");

        @SuppressWarnings("unchecked")
        List<String> tags = body.containsKey("tags") ? (List<String>) body.get("tags") : List.of();

        ForumPost post = ForumPost.builder()
                .title(title)
                .content(content)
                .author(author)
                .tags(tags)
                .build();
        ForumPost saved = forumPostRepository.save(post);
        log.info("Forum post created: '{}' (id={}) by user '{}'", title, saved.getId(), email);
        return ForumPostResponse.fromSummary(saved);
    }

    @Override
    public ForumCommentResponse addComment(Long postId, String content) {
        if (content == null || content.isBlank()) throw new BadRequestException("Comment content is required");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var author = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Forum post", postId));

        ForumComment comment = ForumComment.builder()
                .content(content)
                .post(post)
                .author(author)
                .build();
        ForumComment saved = forumCommentRepository.save(comment);
        log.debug("Comment added to post id={} by user '{}'", postId, email);
        return ForumCommentResponse.from(saved);
    }

    @Override
    public void upvotePost(Long postId) {
        var post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Forum post", postId));
        post.setUpvotes(post.getUpvotes() + 1);
        forumPostRepository.save(post);
    }

    @Override
    public void acceptAnswer(Long commentId) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        // Verify requester is the post author
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!comment.getPost().getAuthor().getEmail().equals(email)) {
            throw new BadRequestException("Only the post author can accept an answer");
        }

        comment.setAccepted(true);
        comment.getPost().setSolved(true);
        forumCommentRepository.save(comment);
    }
}
