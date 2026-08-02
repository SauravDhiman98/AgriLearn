package com.agrilearn.controller;

import com.agrilearn.dto.ExamDto;
import com.agrilearn.entity.ChapterNotes;
import com.agrilearn.entity.SubjectChapter;
import com.agrilearn.entity.User;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.ChapterNotesRepository;
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
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotesFileController {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("application/pdf");

    private final ChapterNotesRepository notesRepository;
    private final SubjectChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;
    private final PdfWatermarkServiceImpl pdfWatermarkService;

    @Value("${minio.bucket.documents}")
    private String documentsBucket;

    /**
     * Streams a watermarked PDF to the authenticated user.
     * The user's name + email are stamped diagonally across every page.
     * The file is served inline (no download header) to prevent "Save As".
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

        // Resolve user info for watermark
        String userEmail = principal != null ? principal.getEmail() : "Tassy Point User";
        String userName  = "";
        if (principal != null) {
            userRepository.findByEmail(principal.getEmail()).ifPresent(u ->
                    ((Runnable) () -> {}).run() // resolved below
            );
            User user = userRepository.findByEmail(principal.getEmail()).orElse(null);
            if (user != null) userName = (user.getFirstName() + " " + user.getLastName()).trim();
        }

        try {
            // Get a short-lived presigned URL and fetch the raw PDF
            String presigned = minioService.getPresignedUrl(documentsBucket, note.getFileUrl(), 60);
            byte[] watermarked;
            try (InputStream in = new URL(presigned).openStream()) {
                watermarked = pdfWatermarkService.watermark(in, userEmail, userName);
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (note.getFileName() != null ? note.getFileName() : "note.pdf") + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header("X-Content-Type-Options", "nosniff")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(watermarked);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

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
