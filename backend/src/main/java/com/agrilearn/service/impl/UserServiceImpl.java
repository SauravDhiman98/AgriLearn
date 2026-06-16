package com.agrilearn.service.impl;

import com.agrilearn.dto.response.UserResponse;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

    @Override
    public UserResponse updateProfile(Map<String, String> updates) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (updates.containsKey("firstName") && !updates.get("firstName").isBlank())
            user.setFirstName(updates.get("firstName"));
        if (updates.containsKey("lastName") && !updates.get("lastName").isBlank())
            user.setLastName(updates.get("lastName"));
        if (updates.containsKey("phone"))
            user.setPhone(updates.get("phone"));
        if (updates.containsKey("bio"))
            user.setBio(updates.get("bio"));
        if (updates.containsKey("state"))
            user.setState(updates.get("state"));
        if (updates.containsKey("preferredLanguage"))
            user.setPreferredLanguage(updates.get("preferredLanguage"));

        UserResponse updated = UserResponse.from(userRepository.save(user));
        log.info("Profile updated for user '{}'", email);
        return updated;
    }

    @Override
    public UserResponse uploadAvatar(MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // TODO: Upload to MinIO and save URL
        // String url = minioService.upload(file, "avatars");
        // user.setAvatarUrl(url);
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    public void changePassword(String currentPassword, String newPassword) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new BadRequestException("Current password is incorrect");
        if (newPassword == null || newPassword.length() < 8)
            throw new BadRequestException("New password must be at least 8 characters");

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user '{}'", email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }
}
