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
 * Catch-all SPA controller — serves React's index.html for every GET request
 * that is NOT an API call and NOT a static asset.
 * This enables React Router client-side routing on hard refresh / direct URL.
 */
@RestController
public class SpaController {

    private final Resource indexHtml = new ClassPathResource("static/index.html");

    /** Matches any path that doesn't start with /api, /actuator, or look like a static file */
    @GetMapping(value = "/**", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> spa(HttpServletRequest request) throws IOException {
        String path = request.getRequestURI();

        // Let Spring handle actual API, actuator and static asset requests
        if (path.startsWith("/api/") || path.startsWith("/actuator")
                || path.contains(".") ) {  // .js .css .png .ico etc
            return ResponseEntity.notFound().build();
        }

        if (!indexHtml.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(indexHtml);
    }
}
