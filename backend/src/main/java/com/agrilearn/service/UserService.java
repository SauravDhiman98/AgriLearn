package com.agrilearn.service;

import com.agrilearn.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface UserService {
    UserResponse getCurrentUser();
    UserResponse updateProfile(Map<String, String> updates);
    UserResponse uploadAvatar(MultipartFile file);
    void changePassword(String currentPassword, String newPassword);
    List<UserResponse> listAll();
}
