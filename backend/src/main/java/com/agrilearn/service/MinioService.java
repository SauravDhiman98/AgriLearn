package com.agrilearn.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface MinioService {
    String uploadFile(MultipartFile file, String bucket, String objectName);
    String getPresignedUrl(String bucket, String objectName, int expirySeconds);
    void deleteFile(String bucket, String objectName);
    boolean bucketExists(String bucket);
    void ensureBucketExists(String bucket);
}
