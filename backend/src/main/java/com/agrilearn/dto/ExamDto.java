package com.agrilearn.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.Map;

public class ExamDto {

    @Data
    public static class ExamResponse {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private String slug;
        private boolean active;
        private int subjectCount;
    }

    @Data
    public static class ExamDetailResponse {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private String slug;
        private List<SubjectResponse> subjects;
    }

    @Data
    public static class SubjectResponse {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private int orderIndex;
        private int chapterCount;
    }

    @Data
    public static class SubjectDetailResponse {
        private Long id;
        private Long examId;
        private String examName;
        private String name;
        private String description;
        private String icon;
        private List<ChapterResponse> chapters;
    }

    @Data
    public static class ChapterResponse {
        private Long id;
        private String title;
        private String description;
        private int orderIndex;
        private int notesCount;
        private int videosCount;
        private int testsCount;
    }

    @Data
    public static class ChapterDetailResponse {
        private Long id;
        private Long subjectId;
        private String subjectName;
        private String examName;
        private String title;
        private String description;
        private List<NotesResponse> notes;
        private List<VideoResponse> videos;
        private List<McqTestResponse> tests;
    }

    @Data
    public static class NotesResponse {
        private Long id;
        private String title;
        private String content;
        private int orderIndex;
    }

    @Data
    public static class VideoResponse {
        private Long id;
        private String title;
        private String youtubeUrl;
        private String youtubeVideoId;
        private String description;
        private int orderIndex;
    }

    @Data
    public static class McqTestResponse {
        private Long id;
        private String title;
        private boolean aiGenerated;
        private int totalQuestions;
        private int timeLimitMinutes;
        private Long notesId;
    }

    @Data
    public static class McqTestDetailResponse {
        private Long id;
        private String title;
        private boolean aiGenerated;
        private int totalQuestions;
        private int timeLimitMinutes;
        private List<McqQuestionResponse> questions;
    }

    @Data
    public static class McqQuestionResponse {
        private Long id;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private int orderIndex;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class McqQuestionWithAnswerResponse extends McqQuestionResponse {
        private String correctOption;
        private String explanation;
    }

    @Data
    public static class McqAttemptRequest {
        private Long testId;
        private Map<Long, String> answers;
    }

    @Data
    public static class McqAttemptResponse {
        private Long id;
        private int score;
        private int totalQuestions;
        private double percentage;
        private List<McqQuestionWithAnswerResponse> questions;
        private Map<Long, String> userAnswers;
    }

    @Data
    public static class CreateExamRequest {
        private String name;
        private String description;
        private String icon;
        private String slug;
    }

    @Data
    public static class CreateSubjectRequest {
        private String name;
        private String description;
        private String icon;
        private int orderIndex;
    }

    @Data
    public static class CreateChapterRequest {
        private String title;
        private String description;
        private int orderIndex;
    }

    @Data
    public static class CreateNotesRequest {
        private String title;
        private String content;
        private int orderIndex;
    }

    @Data
    public static class CreateVideoRequest {
        private String title;
        private String youtubeUrl;
        private String description;
        private int orderIndex;
    }

    @Data
    public static class CreateMcqTestRequest {
        private String title;
        private Long notesId;
        private int totalQuestions;
        private int timeLimitMinutes;
    }

    @Data
    public static class GenerateMcqRequest {
        private Long notesId;
        private int questionCount;
    }
}
