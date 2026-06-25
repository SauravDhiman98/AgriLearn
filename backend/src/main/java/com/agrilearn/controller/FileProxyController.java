package com.agrilearn.controller;

import com.agrilearn.service.MinioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Proxies file downloads from B2/MinIO through the backend so the browser
 * never makes a direct cross-origin request (avoids CORS errors on B2).
 *
 * GET /files/proxy/{bucket}/{*objectName}
 */
@RestController
@RequestMapping("/files/proxy")
@RequiredArgsConstructor
@Slf4j
public class FileProxyController {

    private final MinioService minioService;

    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "pdf",  "application/pdf",
            "doc",  "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "png",  "image/png",
            "jpg",  "image/jpeg",
            "jpeg", "image/jpeg"
    );

    @GetMapping("/{bucket}/**")
    public void proxyFile(@PathVariable String bucket,
                          HttpServletRequest request,
                          HttpServletResponse response) throws Exception {
        // Extract the full object name from the remainder of the path
        String prefix = "/api/v1/files/proxy/" + bucket + "/";
        String fullPath = request.getRequestURI();
        String objectName = URLDecoder.decode(
                fullPath.substring(fullPath.indexOf(prefix) + prefix.length()),
                StandardCharsets.UTF_8);

        log.info("Proxying file: bucket='{}' object='{}'", bucket, objectName);

        String ext = objectName.contains(".")
                ? objectName.substring(objectName.lastIndexOf('.') + 1).toLowerCase()
                : "";
        String contentType = CONTENT_TYPES.getOrDefault(ext, "application/octet-stream");

        response.setHeader("Content-Type", contentType);
        response.setHeader("Cache-Control", "public, max-age=3600");
        // Allow inline display (needed for PDF iframe / mammoth fetch)
        response.setHeader("Content-Disposition", "inline; filename=\"" + objectName.substring(objectName.lastIndexOf('/') + 1) + "\"");

        try (InputStream is = minioService.streamFile(bucket, objectName)) {
            is.transferTo(response.getOutputStream());
            response.flushBuffer();
        } catch (Exception e) {
            log.error("Failed to proxy file '{}/{}': {}", bucket, objectName, e.getMessage());
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found");
        }
    }
}
