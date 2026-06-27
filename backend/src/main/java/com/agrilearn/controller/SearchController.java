package com.agrilearn.controller;

import com.agrilearn.entity.ChapterNotes;
import com.agrilearn.entity.Exam;
import com.agrilearn.entity.ExamSubject;
import com.agrilearn.entity.SubjectChapter;
import com.agrilearn.repository.ChapterNotesRepository;
import com.agrilearn.repository.ExamRepository;
import com.agrilearn.repository.ExamSubjectRepository;
import com.agrilearn.repository.SubjectChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class SearchController {

    private final ExamRepository examRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final SubjectChapterRepository subjectChapterRepository;
    private final ChapterNotesRepository chapterNotesRepository;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam("q") String q) {
        String keyword = q == null ? "" : q.trim();
        if (keyword.isBlank()) {
            return ResponseEntity.ok(Map.of("exams", List.of(), "subjects", List.of(), "chapters", List.of()));
        }

        List<Map<String, Object>> exams = examRepository.searchByKeyword(keyword).stream()
                .limit(10)
                .map(this::toExamResult)
                .toList();

        List<Map<String, Object>> subjects = examSubjectRepository.findTop10ByNameContainingIgnoreCaseOrderByNameAsc(keyword).stream()
                .map(this::toSubjectResult)
                .toList();

        Map<Long, Map<String, Object>> chapterMap = new LinkedHashMap<>();
        for (SubjectChapter chapter : subjectChapterRepository.findTop10ByTitleContainingIgnoreCaseOrderByTitleAsc(keyword)) {
            chapterMap.put(chapter.getId(), toChapterResult(chapter, null));
        }
        for (ChapterNotes note : chapterNotesRepository.findTop10ByTitleContainingIgnoreCaseOrderByTitleAsc(keyword)) {
            SubjectChapter chapter = note.getChapter();
            chapterMap.putIfAbsent(chapter.getId(), toChapterResult(chapter, note.getTitle()));
        }

        return ResponseEntity.ok(Map.of(
                "exams", exams,
                "subjects", subjects,
                "chapters", new ArrayList<>(chapterMap.values())
        ));
    }

    private Map<String, Object> toExamResult(Exam exam) {
        return Map.of(
                "id", exam.getId(),
                "name", exam.getName(),
                "description", exam.getDescription() == null ? "" : exam.getDescription()
        );
    }

    private Map<String, Object> toSubjectResult(ExamSubject subject) {
        return Map.of(
                "id", subject.getId(),
                "name", subject.getName(),
                "description", subject.getDescription() == null ? "" : subject.getDescription(),
                "examId", subject.getExam().getId(),
                "examName", subject.getExam().getName()
        );
    }

    private Map<String, Object> toChapterResult(SubjectChapter chapter, String matchedNoteTitle) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", chapter.getId());
        response.put("title", chapter.getTitle());
        response.put("description", chapter.getDescription() == null ? "" : chapter.getDescription());
        response.put("subjectId", chapter.getSubject().getId());
        response.put("subjectName", chapter.getSubject().getName());
        response.put("examId", chapter.getSubject().getExam().getId());
        response.put("examName", chapter.getSubject().getExam().getName());
        if (matchedNoteTitle != null) {
            response.put("matchedNoteTitle", matchedNoteTitle);
        }
        return response;
    }
}
