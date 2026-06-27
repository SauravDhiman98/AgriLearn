package com.agrilearn.controller;

import com.agrilearn.entity.McqQuestion;
import com.agrilearn.entity.QuestionBookmark;
import com.agrilearn.entity.User;
import com.agrilearn.entity.UserBadge;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.McqQuestionRepository;
import com.agrilearn.repository.QuestionBookmarkRepository;
import com.agrilearn.repository.UserBadgeRepository;
import com.agrilearn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class GamificationController {

    private final UserRepository userRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final QuestionBookmarkRepository questionBookmarkRepository;
    private final McqQuestionRepository mcqQuestionRepository;

    @PostMapping("/bookmarks/questions/{questionId}")
    public ResponseEntity<Map<String, Object>> toggleQuestionBookmark(@PathVariable Long questionId) {
        User user = getCurrentUser();
        boolean bookmarked;
        if (questionBookmarkRepository.existsByUserIdAndQuestionId(user.getId(), questionId)) {
            questionBookmarkRepository.deleteByUserIdAndQuestionId(user.getId(), questionId);
            bookmarked = false;
        } else {
            McqQuestion question = mcqQuestionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
            QuestionBookmark bookmark = QuestionBookmark.builder()
                    .user(user)
                    .question(question)
                    .createdAt(LocalDateTime.now())
                    .build();
            questionBookmarkRepository.save(bookmark);
            bookmarked = true;
            awardBadge(user, "BOOKMARKER");
        }
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    @GetMapping("/bookmarks/questions")
    public ResponseEntity<List<Map<String, Object>>> getBookmarkedQuestions() {
        User user = getCurrentUser();
        List<Map<String, Object>> bookmarks = questionBookmarkRepository.findByUserId(user.getId()).stream()
                .map(bookmark -> {
                    McqQuestion question = bookmark.getQuestion();
                    return Map.<String, Object>of(
                            "bookmarkId", bookmark.getId(),
                            "questionId", question.getId(),
                            "question", question.getQuestion(),
                            "optionA", question.getOptionA(),
                            "optionB", question.getOptionB(),
                            "optionC", question.getOptionC(),
                            "optionD", question.getOptionD(),
                            "testId", question.getTest().getId(),
                            "testTitle", question.getTest().getTitle(),
                            "createdAt", bookmark.getCreatedAt()
                    );
                })
                .toList();
        return ResponseEntity.ok(bookmarks);
    }

    @GetMapping("/me/stats")
    public ResponseEntity<Map<String, Object>> getMyStats() {
        User user = getCurrentUser();
        List<Map<String, Object>> badges = userBadgeRepository.findByUserId(user.getId()).stream()
                .map(badge -> Map.<String, Object>of(
                        "badgeType", badge.getBadgeType(),
                        "earnedAt", badge.getEarnedAt()
                ))
                .toList();
        return ResponseEntity.ok(Map.of(
                "streakCount", user.getStreakCount(),
                "totalPoints", user.getTotalPoints(),
                "badges", badges
        ));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void awardBadge(User user, String badgeType) {
        if (userBadgeRepository.existsByUserIdAndBadgeType(user.getId(), badgeType)) {
            return;
        }
        userBadgeRepository.save(UserBadge.builder()
                .user(user)
                .badgeType(badgeType)
                .earnedAt(LocalDateTime.now())
                .build());
    }
}
