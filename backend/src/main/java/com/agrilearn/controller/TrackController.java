package com.agrilearn.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Lightweight tracking endpoints — no auth required.
 * Writes directly to admin analytics tables (visits, api_logs) shared with the Node.js admin backend.
 */
@RestController
@RequestMapping("/track")
@RequiredArgsConstructor
public class TrackController {

    private final JdbcTemplate jdbc;

    @PostMapping("/visit")
    public ResponseEntity<Map<String, Boolean>> trackVisit(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        String sessionId = (String) body.get("sessionId");
        String path = (String) body.get("path");

        if (sessionId == null || path == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }

        Object userIdObj = body.get("userId");
        Long userId = userIdObj instanceof Number n ? n.longValue() : null;
        String platform = body.getOrDefault("platform", "web").toString();
        String referrer = (String) body.getOrDefault("referrer", null);
        String userAgent = (String) body.getOrDefault("userAgent", null);

        String ipAddress = resolveIp(request);

        try {
            jdbc.update(
                "INSERT INTO visits (session_id, user_id, path, platform, ip_address, user_agent, referrer) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                sessionId, userId, path, platform, ipAddress, userAgent, referrer
            );
        } catch (Exception e) {
            // Table may not exist yet — non-fatal
        }

        return ResponseEntity.status(201).body(Map.of("success", true));
    }

    @PostMapping("/api-call")
    public ResponseEntity<Map<String, Boolean>> trackApiCall(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        String method = (String) body.get("method");
        String endpoint = (String) body.get("endpoint");

        if (method == null || endpoint == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }

        Object statusObj = body.get("statusCode");
        Integer statusCode = statusObj instanceof Number n ? n.intValue() : null;
        Object rtObj = body.get("responseTimeMs");
        Integer responseTimeMs = rtObj instanceof Number n ? n.intValue() : null;
        Object userIdObj = body.get("userId");
        Long userId = userIdObj instanceof Number n ? n.longValue() : null;
        String platform = body.getOrDefault("platform", "web").toString();
        String ipAddress = resolveIp(request);

        try {
            jdbc.update(
                "INSERT INTO api_logs (method, endpoint, status_code, response_time_ms, user_id, ip_address, platform) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                method.toUpperCase(), endpoint, statusCode, responseTimeMs, userId, ipAddress, platform
            );
        } catch (Exception e) {
            // Table may not exist yet — non-fatal
        }

        return ResponseEntity.status(201).body(Map.of("success", true));
    }

    @PostMapping("/visit-end")
    public ResponseEntity<Map<String, Boolean>> trackVisitEnd(@RequestBody Map<String, Object> body) {
        String sessionId = (String) body.get("sessionId");
        if (sessionId == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }

        Object durObj = body.get("durationSeconds");
        int durationSeconds = durObj instanceof Number n ? n.intValue() : 0;

        try {
            jdbc.update(
                "UPDATE visits SET duration_seconds = ? " +
                "WHERE id = (SELECT id FROM visits WHERE session_id = ? ORDER BY created_at DESC, id DESC LIMIT 1)",
                durationSeconds, sessionId
            );
        } catch (Exception e) {
            // Non-fatal
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
