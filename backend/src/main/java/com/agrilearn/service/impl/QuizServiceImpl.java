package com.agrilearn.service.impl;

import com.agrilearn.entity.Quiz;
import com.agrilearn.entity.QuestionOption;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.CourseRepository;
import com.agrilearn.repository.EnrollmentRepository;
import com.agrilearn.repository.QuizRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Override
    public List<Quiz> getQuizzesByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", courseId);
        }
        return quizRepository.findByCourseId(courseId);
    }

    @Override
    public Map<String, Object> getQuizById(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        // Return questions without revealing correct answers
        var questions = quiz.getQuestions().stream().map(q -> {
            var opts = q.getOptions().stream().map(opt -> Map.of(
                    "id", opt.getId(),
                    "text", opt.getOptionText()
                    // 'correct' field intentionally omitted
            )).collect(Collectors.toList());
            return Map.of(
                    "id", q.getId(),
                    "questionText", q.getQuestionText(),
                    "type", q.getType().name(),
                    "imageUrl", q.getImageUrl() != null ? q.getImageUrl() : "",
                    "options", opts
            );
        }).collect(Collectors.toList());

        return Map.of(
                "id", quiz.getId(),
                "title", quiz.getTitle(),
                "description", quiz.getDescription() != null ? quiz.getDescription() : "",
                "timeLimitMinutes", quiz.getTimeLimitMinutes(),
                "passingScore", quiz.getPassingScore(),
                "questionCount", quiz.getQuestions().size(),
                "questions", questions
        );
    }

    @Override
    @Transactional
    public Map<String, Object> submitQuiz(Long quizId, Map<Long, Long> answers) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        if (quiz.getCourse() != null && !enrollmentRepository
                .existsByStudentIdAndCourseId(user.getId(), quiz.getCourse().getId())) {
            throw new BadRequestException("You must be enrolled in the course to take this quiz");
        }

        if (answers == null || answers.isEmpty()) {
            throw new BadRequestException("No answers submitted");
        }

        int correctCount = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (var question : quiz.getQuestions()) {
            Long selectedOptionId = answers.get(question.getId());
            boolean isCorrect = false;
            Long correctOptionId = null;
            String explanation = question.getExplanation();

            // Find the correct option
            for (QuestionOption opt : question.getOptions()) {
                if (opt.isCorrect()) correctOptionId = opt.getId();
            }

            // Check if selected answer is correct
            if (selectedOptionId != null) {
                isCorrect = question.getOptions().stream()
                        .filter(o -> o.getId().equals(selectedOptionId))
                        .findFirst()
                        .map(QuestionOption::isCorrect)
                        .orElse(false);
            }

            if (isCorrect) correctCount++;

            results.add(Map.of(
                    "questionId", question.getId(),
                    "correct", isCorrect,
                    "selectedOptionId", selectedOptionId != null ? selectedOptionId : -1L,
                    "correctOptionId", correctOptionId != null ? correctOptionId : -1L,
                    "explanation", explanation != null ? explanation : ""
            ));
        }

        int totalQuestions = quiz.getQuestions().size();
        double scorePercent = totalQuestions > 0
                ? Math.round((correctCount * 100.0) / totalQuestions * 10.0) / 10.0 : 0;
        boolean passed = scorePercent >= quiz.getPassingScore();

        log.info("Quiz id={} submitted by user '{}' — score={}% ({})",
                quizId, email, scorePercent, passed ? "PASSED" : "FAILED");

        return Map.of(
                "quizId", quizId,
                "totalQuestions", totalQuestions,
                "correctAnswers", correctCount,
                "scorePercent", scorePercent,
                "passingScore", quiz.getPassingScore(),
                "passed", passed,
                "results", results
        );
    }
}
