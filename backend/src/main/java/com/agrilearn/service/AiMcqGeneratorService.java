package com.agrilearn.service;

import com.agrilearn.dto.ExamDto;

import java.util.List;

public interface AiMcqGeneratorService {
    List<ExamDto.McqQuestionWithAnswerResponse> generateQuestions(String notesContent, int count);
    String convertToHtml(String rawText);
}
