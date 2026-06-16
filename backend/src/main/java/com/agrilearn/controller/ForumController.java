package com.agrilearn.controller;

import com.agrilearn.dto.response.ForumCommentResponse;
import com.agrilearn.dto.response.ForumPostResponse;
import com.agrilearn.service.ForumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/forum")
@RequiredArgsConstructor
@Tag(name = "Forum", description = "Community Q&A forum for agriculture topics")
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/posts/public")
    @Operation(summary = "List all forum posts (public)")
    public ResponseEntity<Page<ForumPostResponse>> listPosts(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(forumService.listPosts(tag, keyword, pageable));
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Get a forum post with comments")
    public ResponseEntity<ForumPostResponse> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getPostById(id));
    }

    @PostMapping("/posts")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new forum post")
    public ResponseEntity<ForumPostResponse> createPost(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createPost(body));
    }

    @PostMapping("/posts/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<ForumCommentResponse> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(forumService.addComment(id, body.get("content")));
    }

    @PostMapping("/posts/{id}/upvote")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upvote a post")
    public ResponseEntity<String> upvotePost(@PathVariable Long id) {
        forumService.upvotePost(id);
        return ResponseEntity.ok("Post upvoted");
    }

    @PostMapping("/comments/{id}/accept")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Accept a comment as best answer")
    public ResponseEntity<String> acceptAnswer(@PathVariable Long id) {
        forumService.acceptAnswer(id);
        return ResponseEntity.ok("Answer accepted");
    }
}
