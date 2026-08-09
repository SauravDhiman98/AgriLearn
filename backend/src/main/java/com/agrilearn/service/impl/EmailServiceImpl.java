package com.agrilearn.service.impl;

import com.agrilearn.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    /** Set MAIL_ENABLED=true + RESEND_API_KEY in Railway to actually send emails */
    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    /**
     * Resend API key — get a free one at https://resend.com (3,000 emails/month free).
     * Uses HTTPS so it works on Railway (Railway blocks SMTP ports 587/465).
     */
    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from:Tassy Point <support@tassypoint.in>}")
    private String fromAddress;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String firstName, String resetLink) {
        if (!emailEnabled) {
            log.info("Email disabled — password reset link for {}: {}", to, resetLink);
            return;
        }
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("RESEND_API_KEY not set — password reset link for {}: {}", to, resetLink);
            return;
        }
        try {
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                      <div style="background:#1a7a3c;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                        <img src="https://tassypoint.in/logo.png"
                             alt="Tassy Point"
                             style="width:48px;height:48px;object-fit:contain;border-radius:10px;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;" />
                        <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">TASSY POINT</h1>
                      </div>
                      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
                        <h2 style="color:#333;margin-top:0;">Reset Your Password</h2>
                        <p style="color:#555;">Hi %s,</p>
                        <p style="color:#555;">We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>5 minutes</strong>.</p>
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

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                "from", fromAddress,
                "to", new String[]{to},
                "subject", "Reset Your Tassy Point Password",
                "html", html
            );

            ResponseEntity<String> response = restTemplate.exchange(
                "https://api.resend.com/emails",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Password reset email sent to {} via Resend", to);
            } else {
                log.error("Resend API returned {}: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }
}
