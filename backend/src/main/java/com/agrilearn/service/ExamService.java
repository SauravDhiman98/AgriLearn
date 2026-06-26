package com.agrilearn.service;

import com.agrilearn.dto.ExamDto;

import java.util.List;

public interface ExamService {
    List<ExamDto.ExamResponse> getAllExams();
    ExamDto.ExamDetailResponse getExamById(Long id);
    List<ExamDto.SectionResponse> getSectionsByExam(Long examId);
    ExamDto.SubjectDetailResponse getSubjectById(Long id);
    ExamDto.ChapterDetailResponse getChapterById(Long id);

    ExamDto.ExamResponse createExam(ExamDto.CreateExamRequest req);
    ExamDto.ExamResponse updateExam(Long examId, ExamDto.CreateExamRequest req);
    ExamDto.SectionResponse createSection(Long examId, ExamDto.CreateSectionRequest req);
    ExamDto.SectionResponse updateSection(Long sectionId, ExamDto.CreateSectionRequest req);
    ExamDto.SubjectResponse createSubject(Long examId, ExamDto.CreateSubjectRequest req);
    ExamDto.ChapterResponse createChapter(Long subjectId, ExamDto.CreateChapterRequest req);
    ExamDto.NotesResponse createNotes(Long chapterId, ExamDto.CreateNotesRequest req);
    ExamDto.NotesResponse updateNotes(Long notesId, ExamDto.CreateNotesRequest req);
    ExamDto.VideoResponse createVideo(Long chapterId, ExamDto.CreateVideoRequest req);
    void deleteSection(Long sectionId);
    void deleteNotes(Long notesId);
    void deleteVideo(Long videoId);
    void deleteChapter(Long chapterId);
    void deleteSubject(Long subjectId);
}
