package com.agrilearn.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String firstName, String resetLink);
}
