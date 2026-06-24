package com.agrilearn.service;

import com.agrilearn.dto.ExamDto;

import java.util.List;

public interface McqService {
    ExamDto.McqTestDetailResponse getTestWithQuestions(Long testId, boolean includeAnswers);
    ExamDto.McqAttemptResponse submitAttempt(Long userId, ExamDto.McqAttemptRequest req);
    List<ExamDto.McqAttemptResponse> getUserAttempts(Long userId, Long testId);
    ExamDto.McqTestResponse generateAiMcq(Long notesId, int questionCount, Long chapterId);
}
