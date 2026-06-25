package com.agrilearn.service.impl;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.service.AiMcqGeneratorService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiMcqGeneratorServiceImpl implements AiMcqGeneratorService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

    @Override
    public List<ExamDto.McqQuestionWithAnswerResponse> generateQuestions(String notesContent, int count) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("Gemini API key not configured, returning empty MCQ list");
            return new ArrayList<>();
        }

        String prompt = buildPrompt(notesContent, count);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> part = Map.of("parts", List.of(textPart));
            Map<String, Object> body = Map.of("contents", List.of(part));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            String url = GEMINI_URL + "?key=" + geminiApiKey;

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return parseGeminiResponse(response.getBody());
        } catch (Exception e) {
            log.error("AI MCQ generation failed: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private String buildPrompt(String content, int count) {
        String truncated = content != null && content.length() > 3000 ? content.substring(0, 3000) : content;
        return String.format("""
            Generate exactly %d multiple choice questions based on the following study notes.
            Return ONLY a valid JSON array, no other text, no markdown code blocks.
            Each question must have: question, optionA, optionB, optionC, optionD, correctOption (A/B/C/D), explanation.
            Format example:
            [{"question":"Q?","optionA":"A","optionB":"B","optionC":"C","optionD":"D","correctOption":"A","explanation":"Because..."}]

            Study Notes:
            %s
            """, count, truncated);
    }

    private List<ExamDto.McqQuestionWithAnswerResponse> parseGeminiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            return new ArrayList<>();
        }

        String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
        text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

        List<Map<String, Object>> rawList = objectMapper.readValue(text, new TypeReference<>() {});
        List<ExamDto.McqQuestionWithAnswerResponse> result = new ArrayList<>();
        for (Map<String, Object> item : rawList) {
            ExamDto.McqQuestionWithAnswerResponse q = new ExamDto.McqQuestionWithAnswerResponse();
            q.setQuestion((String) item.get("question"));
            q.setOptionA((String) item.get("optionA"));
            q.setOptionB((String) item.get("optionB"));
            q.setOptionC((String) item.get("optionC"));
            q.setOptionD((String) item.get("optionD"));
            q.setCorrectOption((String) item.get("correctOption"));
            q.setExplanation((String) item.get("explanation"));
            result.add(q);
        }
        return result;
    }
}
