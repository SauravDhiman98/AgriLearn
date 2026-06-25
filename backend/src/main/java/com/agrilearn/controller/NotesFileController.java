package com.agrilearn.controller;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.entity.ChapterNotes;
import com.agrilearn.entity.SubjectChapter;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.ChapterNotesRepository;
import com.agrilearn.repository.SubjectChapterRepository;
import com.agrilearn.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotesFileController {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("application/pdf");

    private final ChapterNotesRepository notesRepository;
    private final SubjectChapterRepository chapterRepository;
    private final MinioService minioService;

    @Value("${minio.bucket.documents}")
    private String documentsBucket;

    @PostMapping("/admin/chapters/{chapterId}/notes/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.NotesResponse> uploadNotesFile(
            @PathVariable Long chapterId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) {

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String extension = getExtension(file.getOriginalFilename(), file.getContentType());
        boolean valid = "pdf".equals(extension)
                || "application/pdf".equals(file.getContentType());
        if (!valid) {
            throw new BadRequestException("Invalid file format. Only PDF is allowed");
        }

        SubjectChapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId));

        String objectKey = "notes/" + chapterId + "/" + UUID.randomUUID() + "." + extension;
        String storedObjectName = minioService.uploadFile(file, documentsBucket, objectKey);

        ChapterNotes notes = ChapterNotes.builder()
                .chapter(chapter)
                .title(title)
                .content(null)
                .fileUrl(storedObjectName)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .fileType(extension)
                .build();

        ChapterNotes savedNotes = notesRepository.save(notes);

        return ResponseEntity.ok(ExamDto.NotesResponse.builder()
                .id(savedNotes.getId())
                .title(savedNotes.getTitle())
                .content(savedNotes.getContent())
                .orderIndex(savedNotes.getOrderIndex())
                .fileUrl(minioService.getPresignedUrl(documentsBucket, storedObjectName, 3600))
                .fileName(savedNotes.getFileName())
                .fileSize(savedNotes.getFileSize())
                .fileType(savedNotes.getFileType())
                .build());
    }

    private String getExtension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        }
        if ("application/pdf".equals(contentType)) return "pdf";
        return "bin";
    }
}
