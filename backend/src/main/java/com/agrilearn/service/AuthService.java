package com.agrilearn.service;

import com.agrilearn.dto.request.LoginRequest;
import com.agrilearn.dto.request.RegisterRequest;
import com.agrilearn.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void verifyEmail(String token);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}
