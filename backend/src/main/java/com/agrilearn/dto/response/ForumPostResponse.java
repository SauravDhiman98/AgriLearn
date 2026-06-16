package com.agrilearn.dto.response;

import com.agrilearn.entity.ForumPost;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder(toBuilder = true)
public class ForumPostResponse {
    private Long id;
    private String title;
    private String content;
    private List<String> tags;
    private int upvotes;
    private int viewCount;
    private boolean pinned;
    private boolean solved;
    private AuthorInfo author;
    private int commentCount;
    private List<ForumCommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class AuthorInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String avatarUrl;
    }

    public static ForumPostResponse fromSummary(ForumPost post) {
        return ForumPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent().length() > 300
                        ? post.getContent().substring(0, 300) + "..."
                        : post.getContent())
                .tags(post.getTags())
                .upvotes(post.getUpvotes())
                .viewCount(post.getViewCount())
                .pinned(post.isPinned())
                .solved(post.isSolved())
                .author(AuthorInfo.builder()
                        .id(post.getAuthor().getId())
                        .firstName(post.getAuthor().getFirstName())
                        .lastName(post.getAuthor().getLastName())
                        .avatarUrl(post.getAuthor().getAvatarUrl())
                        .build())
                .commentCount(post.getComments().size())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public static ForumPostResponse fromDetail(ForumPost post) {
        return fromSummary(post).toBuilder()
                .content(post.getContent())
                .comments(post.getComments().stream()
                        .map(ForumCommentResponse::from)
                        .collect(Collectors.toList()))
                .build();
    }
}
