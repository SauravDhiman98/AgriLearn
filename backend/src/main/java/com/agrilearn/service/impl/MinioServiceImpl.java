package com.agrilearn.service.impl;

import com.agrilearn.service.MinioService;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;

    @Override
    public String uploadFile(MultipartFile file, String bucket, String objectName) {
        try {
            ensureBucketExists(bucket);
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            log.info("Uploaded file '{}' to bucket '{}'", objectName, bucket);
            return objectName;
        } catch (Exception e) {
            log.error("MinIO upload failed for object '{}' in bucket '{}': {}", objectName, bucket, e.getMessage());
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPresignedUrl(String bucket, String objectName, int expirySeconds) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucket)
                    .object(objectName)
                    .expiry(expirySeconds, TimeUnit.SECONDS)
                    .build());
        } catch (Exception e) {
            log.error("Failed to generate pre-signed URL for '{}': {}", objectName, e.getMessage());
            throw new RuntimeException("Failed to generate video URL: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String bucket, String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
            log.info("Deleted file '{}' from bucket '{}'", objectName, bucket);
        } catch (Exception e) {
            log.warn("Failed to delete file '{}' from bucket '{}': {}", objectName, bucket, e.getMessage());
        }
    }

    @Override
    public boolean bucketExists(String bucket) {
        try {
            return minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void ensureBucketExists(String bucket) {
        try {
            if (!bucketExists(bucket)) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("Created MinIO bucket '{}'", bucket);
            }
        } catch (Exception e) {
            log.error("Failed to create bucket '{}': {}", bucket, e.getMessage());
            throw new RuntimeException("Bucket creation failed: " + e.getMessage(), e);
        }
    }
}
