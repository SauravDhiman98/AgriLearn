package com.agrilearn.controller;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.entity.ChapterNotes;
import com.agrilearn.entity.ExamSubject;
import com.agrilearn.entity.SubjectChapter;
import com.agrilearn.entity.User;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.ChapterNotesRepository;
import com.agrilearn.repository.ExamSubjectRepository;
import com.agrilearn.repository.SubjectChapterRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.security.UserPrincipal;
import com.agrilearn.service.MinioService;
import com.agrilearn.service.impl.PdfWatermarkServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotesFileController {

    private final ChapterNotesRepository notesRepository;
    private final SubjectChapterRepository chapterRepository;
    private final ExamSubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;
    private final PdfWatermarkServiceImpl pdfWatermarkService;

    @Value("${minio.bucket.documents}")
    private String documentsBucket;

    /**
     * Streams a watermarked PDF inline. User name + email are stamped
     * diagonally across every page at 12% opacity.
     */
    @GetMapping("/notes/{noteId}/view")
    public ResponseEntity<byte[]> viewWatermarkedNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserPrincipal principal) {

        ChapterNotes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", noteId));

        if (note.getFileUrl() == null || note.getFileUrl().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        String userEmail = principal != null ? principal.getEmail() : "Tassy Point User";
        String userName  = "";
        if (principal != null) {
            User user = userRepository.findByEmail(principal.getEmail()).orElse(null);
            if (user != null) userName = (user.getFirstName() + " " + user.getLastName()).trim();
        }

        try {
            String presigned = minioService.getPresignedUrl(documentsBucket, note.getFileUrl(), 60);
            byte[] watermarked;
            try (InputStream in = new URL(presigned).openStream()) {
                watermarked = pdfWatermarkService.watermark(in, userEmail, userName);
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + (note.getFileName() != null ? note.getFileName() : "note.pdf") + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header("X-Content-Type-Options", "nosniff")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(watermarked);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /** Upload a single PDF to a specific chapter. */
    @PostMapping("/admin/chapters/{chapterId}/notes/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto.NotesResponse> uploadNotesFile(
            @PathVariable Long chapterId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) {

        if (file.isEmpty()) throw new BadRequestException("File is empty");

        String extension = getExtension(file.getOriginalFilename(), file.getContentType());
        if (!"pdf".equals(extension)) throw new BadRequestException("Only PDF files are allowed");

        SubjectChapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId));

        String objectKey      = "notes/" + chapterId + "/" + UUID.randomUUID() + "." + extension;
        String storedKey      = minioService.uploadFile(file, documentsBucket, objectKey);
        ChapterNotes saved    = notesRepository.save(ChapterNotes.builder()
                .chapter(chapter).title(title).content(null)
                .fileUrl(storedKey).fileName(file.getOriginalFilename())
                .fileSize(file.getSize()).fileType(extension).build());

        return ResponseEntity.ok(toResponse(saved, storedKey));
    }

    /**
     * Bulk upload multiple PDFs for a subject.
     * Each PDF filename (without extension) becomes the chapter title.
     * If a chapter with that name already exists, the note is appended to it.
     */
    @PostMapping("/admin/subjects/{subjectId}/notes/bulk-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExamDto.NotesResponse>> bulkUploadNotes(
            @PathVariable Long subjectId,
            @RequestParam("files") List<MultipartFile> files) {

        if (files == null || files.isEmpty()) throw new BadRequestException("No files provided");

        ExamSubject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));

        int existingCount = chapterRepository.countBySubjectId(subjectId);
        List<ExamDto.NotesResponse> results = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            if (file == null || file.isEmpty()) continue;

            String extension = getExtension(file.getOriginalFilename(), file.getContentType());
            if (!"pdf".equals(extension)) continue; // skip non-PDFs silently

            // Derive chapter name from filename
            String raw  = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
            String name = raw.replaceAll("\\.[^.]+$", "").replaceAll("[_\\-]+", " ").trim();
            if (name.isBlank()) name = "Chapter " + (existingCount + i + 1);

            // Reuse existing chapter or create a new one
            final String chapterName = name;
            SubjectChapter chapter = chapterRepository
                    .findBySubjectIdAndTitleIgnoreCase(subjectId, chapterName)
                    .orElseGet(() -> {
                        SubjectChapter c = new SubjectChapter();
                        c.setSubject(subject);
                        c.setTitle(chapterName);
                        c.setOrderIndex(existingCount + (int)(chapterRepository.countBySubjectId(subjectId)));
                        return chapterRepository.save(c);
                    });

            String objectKey = "notes/" + chapter.getId() + "/" + UUID.randomUUID() + "." + extension;
            String storedKey = minioService.uploadFile(file, documentsBucket, objectKey);
            ChapterNotes saved = notesRepository.save(ChapterNotes.builder()
                    .chapter(chapter).title(chapterName).content(null)
                    .fileUrl(storedKey).fileName(file.getOriginalFilename())
                    .fileSize(file.getSize()).fileType(extension).build());

            results.add(toResponse(saved, storedKey));
        }

        return ResponseEntity.ok(results);
    }

    private ExamDto.NotesResponse toResponse(ChapterNotes n, String key) {
        return ExamDto.NotesResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .orderIndex(n.getOrderIndex())
                .fileUrl(minioService.getPresignedUrl(documentsBucket, key, 3600))
                .fileName(n.getFileName())
                .fileSize(n.getFileSize())
                .fileType(n.getFileType())
                .build();
    }

    private String getExtension(String filename, String contentType) {
        if (filename != null && filename.contains("."))
            return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        if ("application/pdf".equals(contentType)) return "pdf";
        return "bin";
    }
}
