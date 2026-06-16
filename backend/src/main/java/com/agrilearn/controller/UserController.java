package com.agrilearn.controller;

import com.agrilearn.dto.response.UserResponse;
import com.agrilearn.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(userService.updateProfile(updates));
    }

    @PostMapping("/me/avatar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload profile avatar")
    public ResponseEntity<UserResponse> uploadAvatar(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(userService.uploadAvatar(file));
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> body) {
        userService.changePassword(body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok("Password updated");
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users (admin)")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userService.listAll());
    }
}
