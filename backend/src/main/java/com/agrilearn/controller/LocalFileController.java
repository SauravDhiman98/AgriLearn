package com.agrilearn.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves locally stored files (dev mode only — minio.local=true).
 * Maps GET /files/{bucket}/{**} to the local uploads directory.
 */
@RestController
@RequestMapping("/files")
@ConditionalOnProperty(name = "minio.local", havingValue = "true")
public class LocalFileController {

    @Value("${minio.local-dir:uploads}")
    private String uploadDir;

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) throws MalformedURLException {
        // Strip /files/ prefix from path
        String rawPath = request.getRequestURI();
        int idx = rawPath.indexOf("/files/");
        String filePath = idx >= 0 ? rawPath.substring(idx + "/files/".length()) : rawPath;

        Path path = Paths.get(uploadDir).resolve(filePath).normalize();
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException e) {
            contentType = "application/octet-stream";
        }
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
