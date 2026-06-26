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

    @Value("${github.models.token:}")
    private String githubToken;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    // GitHub Models — OpenAI-compatible, free with GitHub Copilot
    private static final String GITHUB_MODELS_URL = "https://models.inference.ai.azure.com/chat/completions";
    private static final String GITHUB_MODEL = "gpt-4o-mini";

    // Gemini fallback
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

    @Override
    public List<ExamDto.McqQuestionWithAnswerResponse> generateQuestions(String notesContent, int count) {
        String prompt = buildPrompt(notesContent, count);

        // Try GitHub Models first (free with Copilot)
        if (githubToken != null && !githubToken.isBlank()) {
            log.info("Using GitHub Models (gpt-4o-mini) for MCQ generation");
            try {
                List<ExamDto.McqQuestionWithAnswerResponse> result = callGitHubModels(prompt);
                // Retry once if count doesn't match
                if (result.size() < count) {
                    log.warn("Got {} questions, expected {}. Retrying...", result.size(), count);
                    result = callGitHubModels(buildPrompt(notesContent, count));
                }
                return result;
            } catch (Exception e) {
                log.warn("GitHub Models failed: {}, trying Gemini...", e.getMessage());
            }
        }

        // Fallback to Gemini
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            log.info("Using Gemini for MCQ generation");
            try {
                return callGemini(prompt);
            } catch (Exception e) {
                log.error("Gemini MCQ generation failed: {}", e.getMessage());
            }
        }

        log.warn("No AI provider configured (set GITHUB_TOKEN or GEMINI_API_KEY)");
        return new ArrayList<>();
    }

    private List<ExamDto.McqQuestionWithAnswerResponse> callGitHubModels(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(githubToken);

        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> body = Map.of(
                "model", GITHUB_MODEL,
                "messages", List.of(message),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(GITHUB_MODELS_URL, request, String.class);
        return parseOpenAiResponse(response.getBody());
    }

    private List<ExamDto.McqQuestionWithAnswerResponse> callGemini(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", geminiApiKey);

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> part = Map.of("parts", List.of(textPart));
        Map<String, Object> body = Map.of("contents", List.of(part));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_URL, request, String.class);
        return parseGeminiResponse(response.getBody());
    }

    private String buildPrompt(String content, int count) {
        String truncated = content != null && content.length() > 3000 ? content.substring(0, 3000) : content;
        return String.format("""
            You MUST generate EXACTLY %d multiple choice questions based on the following study notes.
            IMPORTANT: The JSON array must contain EXACTLY %d objects — no more, no less.
            Return ONLY a valid JSON array, no other text, no markdown code blocks.
            Each question must have: question, optionA, optionB, optionC, optionD, correctOption (A/B/C/D), explanation.
            Format example:
            [{"question":"Q?","optionA":"A","optionB":"B","optionC":"C","optionD":"D","correctOption":"A","explanation":"Because..."}]

            Study Notes:
            %s
            """, count, count, truncated);
    }

    private List<ExamDto.McqQuestionWithAnswerResponse> parseOpenAiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String text = root.path("choices").get(0).path("message").path("content").asText();
        text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        return parseQuestionList(text);
    }

    private List<ExamDto.McqQuestionWithAnswerResponse> parseGeminiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) return new ArrayList<>();
        String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
        text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        return parseQuestionList(text);
    }

    private List<ExamDto.McqQuestionWithAnswerResponse> parseQuestionList(String json) throws Exception {
        List<Map<String, Object>> rawList = objectMapper.readValue(json, new TypeReference<>() {});
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
