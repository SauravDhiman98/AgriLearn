package com.agrilearn.service.impl;

import com.agrilearn.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    /** Injected only when spring.mail.username is configured */
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /** Set MAIL_ENABLED=true in Railway/Render to actually send emails */
    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String firstName, String resetLink) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled — password reset link for {}: {}", to, resetLink);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Reset Your Tassy Point Password");

            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                      <div style="background:#1a7a3c;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:24px;">🌱 Tassy Point</h1>
                      </div>
                      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
                        <h2 style="color:#333;margin-top:0;">Reset Your Password</h2>
                        <p style="color:#555;">Hi %s,</p>
                        <p style="color:#555;">We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>
                        <div style="text-align:center;margin:30px 0;">
                          <a href="%s"
                             style="background:#1a7a3c;color:#fff;padding:14px 28px;border-radius:6px;
                                    text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">
                            Reset Password
                          </a>
                        </div>
                        <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
                        <p style="color:#888;font-size:13px;">Or copy this link:<br><a href="%s" style="color:#1a7a3c;">%s</a></p>
                      </div>
                    </div>
                    """.formatted(firstName, resetLink, resetLink, resetLink);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }
}
