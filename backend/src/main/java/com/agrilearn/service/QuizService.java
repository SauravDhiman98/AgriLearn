package com.agrilearn.service;

import com.agrilearn.entity.Quiz;

import java.util.List;
import java.util.Map;

public interface QuizService {
    /** Get all quizzes for a course */
    List<Quiz> getQuizzesByCourse(Long courseId);

    /** Get quiz with full questions (correct answers hidden for non-admin) */
    Map<String, Object> getQuizById(Long quizId);

    /** Submit quiz answers and return score */
    Map<String, Object> submitQuiz(Long quizId, Map<Long, Long> answers);
}
