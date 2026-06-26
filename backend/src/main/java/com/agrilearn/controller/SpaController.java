package com.agrilearn.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * Serves React's index.html for all non-API, non-static routes.
 * Enables client-side routing (React Router) when the app is
 * served from the same Spring Boot container.
 */
@RestController
public class SpaController {

    private final Resource indexHtml = new ClassPathResource("static/index.html");

    @GetMapping(value = {
        "/",
        "/login", "/register",
        "/dashboard", "/profile",
        "/exams/**", "/exam-info",
        "/subjects/**", "/exam-chapters/**",
        "/mcq-tests/**",
        "/courses/**",
        "/forum/**",
        "/marketplace/**",
        "/live-classes",
        "/admin/**",
        "/instructor/**"
    }, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> spa(HttpServletRequest request) throws IOException {
        if (!indexHtml.exists()) {
            // Not running in bundled mode (local dev) — let Spring return 404
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(indexHtml);
    }
}
