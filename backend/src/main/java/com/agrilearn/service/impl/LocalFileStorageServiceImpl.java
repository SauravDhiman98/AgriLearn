package com.agrilearn.service.impl;

import com.agrilearn.service.MinioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Local filesystem storage — active when minio.local=true (dev mode).
 * Files are stored under ${minio.local-dir}/bucket/objectName.
 * Presigned URLs are replaced with a simple /api/v1/files/... HTTP endpoint.
 */
@Service
@ConditionalOnProperty(name = "minio.local", havingValue = "true")
@Slf4j
public class LocalFileStorageServiceImpl implements MinioService {

    @Value("${minio.local-dir:uploads}")
    private String uploadDir;

    @Value("${server.servlet.context-path:/api/v1}")
    private String contextPath;

    @Override
    public String uploadFile(MultipartFile file, String bucket, String objectName) {
        try {
            Path dir = Paths.get(uploadDir, bucket, objectName).getParent();
            Files.createDirectories(dir);
            Path target = Paths.get(uploadDir, bucket, objectName);
            Files.copy(file.getInputStream(), target,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            log.info("Saved file locally: {}", target);
            return objectName;
        } catch (IOException e) {
            log.error("Local file save failed: {}", e.getMessage());
            throw new RuntimeException("File save failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPresignedUrl(String bucket, String objectName, int expirySeconds) {
        // Return a URL that the LocalFileController can serve
        return contextPath + "/files/" + bucket + "/" + objectName;
    }

    @Override
    public InputStream streamFile(String bucket, String objectName) {
        try {
            Path target = Paths.get(uploadDir, bucket, objectName);
            return Files.newInputStream(target);
        } catch (IOException e) {
            log.error("Failed to stream local file '{}/{}': {}", bucket, objectName, e.getMessage());
            throw new RuntimeException("File stream failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String bucket, String objectName) {
        try {
            Path target = Paths.get(uploadDir, bucket, objectName);
            Files.deleteIfExists(target);
            log.info("Deleted local file: {}", target);
        } catch (IOException e) {
            log.warn("Failed to delete local file: {}", e.getMessage());
        }
    }

    @Override
    public boolean bucketExists(String bucket) {
        return Files.isDirectory(Paths.get(uploadDir, bucket));
    }

    @Override
    public void ensureBucketExists(String bucket) {
        try {
            Files.createDirectories(Paths.get(uploadDir, bucket));
        } catch (IOException e) {
            log.warn("Could not create local bucket dir: {}", e.getMessage());
        }
    }
}
