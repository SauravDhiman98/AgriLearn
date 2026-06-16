package com.agrilearn.service.impl;

import com.agrilearn.dto.request.LoginRequest;
import com.agrilearn.dto.request.RegisterRequest;
import com.agrilearn.dto.response.AuthResponse;
import com.agrilearn.dto.response.UserResponse;
import com.agrilearn.entity.User;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.security.JwtTokenProvider;
import com.agrilearn.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User.Role role = User.Role.STUDENT;
        if (request.getRole() != null) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
                // ADMIN role cannot be self-assigned
                if (role == User.Role.ADMIN) role = User.Role.STUDENT;
            } catch (IllegalArgumentException ignored) {}
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en")
                .state(request.getState())
                .enabled(true) // set to false + email verification in production
                .emailVerificationToken(UUID.randomUUID().toString())
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        // TODO: send email verification
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = jwtTokenProvider.generateToken(auth);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.of(accessToken, refreshToken, UserResponse.from(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String accessToken = jwtTokenProvider.generateToken(auth);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.of(accessToken, refreshToken, UserResponse.from(user));
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }
        String email = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);

        return AuthResponse.of(newAccessToken, newRefreshToken, UserResponse.from(user));
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        user.setEnabled(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    @Override
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // TODO: generate reset token and send email
            log.info("Password reset requested for: {}", email);
        });
    }
}
