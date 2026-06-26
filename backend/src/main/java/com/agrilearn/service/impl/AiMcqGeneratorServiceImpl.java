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

    private static final String EXAM_HTML_STYLES = """
            <style>
            .eic{font-family:Inter,system-ui,sans-serif;font-size:14.5px;line-height:1.8;color:#1f2937}
            .eic h2{font-size:17px;font-weight:800;margin:24px 0 12px;padding:10px 18px;background:linear-gradient(90deg,#194552,#0d6e84);color:#fff;border-radius:8px}
            .eic h2:first-child{margin-top:0}
            .eic h3{font-size:15px;font-weight:700;margin:18px 0 8px;padding:7px 14px;border-left:4px solid #16a34a;background:#f0fdf4;color:#14532d;border-radius:0 6px 6px 0}
            .eic h4{font-size:14px;font-weight:700;color:#0369a1;margin:10px 0 5px}
            .eic p{margin-bottom:10px}
            .eic ul{list-style:none;padding:0;margin-bottom:12px}
            .eic ul li{padding:4px 4px 4px 24px;position:relative;margin-bottom:3px}
            .eic ul li::before{content:'✦';position:absolute;left:4px;color:#16a34a;font-size:10px;top:7px}
            .eic ol{list-style:none;padding:0;margin-bottom:14px;counter-reset:s}
            .eic ol>li{counter-increment:s;padding:10px 14px 10px 46px;position:relative;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px}
            .eic ol>li::before{content:counter(s);position:absolute;left:12px;top:12px;background:#194552;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
            .eic table{width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13.5px;border-radius:10px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.1)}
            .eic thead tr{background:linear-gradient(90deg,#194552,#0d6e84)}
            .eic th{color:#fff;padding:10px 14px;text-align:left;font-weight:700;border:none}
            .eic td{padding:9px 14px;border-bottom:1px solid #e5e7eb;vertical-align:top}
            .eic tbody tr:nth-child(even){background:#f8fafc}
            .eic tbody tr:hover{background:#f0f9ff}
            .eic strong{color:#0f766e;font-weight:700}
            .eic .highlight-box{background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:6px;padding:12px 16px;margin-bottom:14px}
            </style>
            <div class="eic">
            """;

    @Override
    public String convertToHtml(String rawText) {
        String prompt = buildHtmlPrompt(rawText);
        if (githubToken != null && !githubToken.isBlank()) {
            try {
                String aiHtml = callAiForText(prompt);
                return EXAM_HTML_STYLES + aiHtml + "\n</div>";
            } catch (Exception e) {
                log.warn("HTML conversion via GitHub Models failed: {}", e.getMessage());
            }
        }
        // Fallback: wrap raw text in styled pre tag
        return EXAM_HTML_STYLES + "<pre style=\"white-space:pre-wrap\">" +
                rawText.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") +
                "</pre>\n</div>";
    }

    /** Generic text call — returns the AI's plain text response */
    private String callAiForText(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(githubToken);
        Map<String, Object> body = Map.of(
                "model", GITHUB_MODEL,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.3
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
                GITHUB_MODELS_URL, new HttpEntity<>(body, headers), String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        String text = root.path("choices").get(0).path("message").path("content").asText();
        // Strip any markdown code fences
        return text.replaceAll("(?s)```html\\s*", "").replaceAll("```\\s*", "").trim();
    }

    private String buildHtmlPrompt(String rawText) {
        String truncated = rawText != null && rawText.length() > 8000 ? rawText.substring(0, 8000) : rawText;
        return """
            Convert the following raw exam information text into clean, visually rich, well-structured HTML.

            Strict rules:
            - Use <h2> for major sections (Eligibility, Exam Pattern, Syllabus, Important Dates, Vacancy, etc.)
            - Use <h3> for sub-sections
            - Use <table> with <thead><tr><th>...</th></tr></thead><tbody> for ALL tabular data
            - Use <ul><li> for bullet lists, <ol><li> for numbered/step lists
            - Use <p> for plain paragraphs
            - For important notices or highlights, wrap in: <div class="highlight-box">...</div>
            - Use <strong> to highlight key values (numbers, dates, limits)
            - Keep ALL factual data exactly as given — do NOT invent, summarize or omit anything
            - Return ONLY the HTML body content — no <html>, <head>, <body>, no markdown, no explanation

            Raw exam information:
            """ + truncated;
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
