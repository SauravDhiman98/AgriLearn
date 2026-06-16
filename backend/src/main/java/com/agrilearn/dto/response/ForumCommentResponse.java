package com.agrilearn.dto.response;

import com.agrilearn.entity.ForumComment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ForumCommentResponse {
    private Long id;
    private String content;
    private int upvotes;
    private boolean accepted;
    private AuthorInfo author;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class AuthorInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String avatarUrl;
    }

    public static ForumCommentResponse from(ForumComment comment) {
        return ForumCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .upvotes(comment.getUpvotes())
                .accepted(comment.isAccepted())
                .author(AuthorInfo.builder()
                        .id(comment.getAuthor().getId())
                        .firstName(comment.getAuthor().getFirstName())
                        .lastName(comment.getAuthor().getLastName())
                        .avatarUrl(comment.getAuthor().getAvatarUrl())
                        .build())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
