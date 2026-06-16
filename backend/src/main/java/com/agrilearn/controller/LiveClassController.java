package com.agrilearn.controller;

import com.agrilearn.dto.response.LiveClassResponse;
import com.agrilearn.service.LiveClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/live-classes")
@RequiredArgsConstructor
@Tag(name = "Live Classes", description = "Schedule and join live agricultural classes")
public class LiveClassController {

    private final LiveClassService liveClassService;

    @GetMapping
    @Operation(summary = "List upcoming live classes")
    public ResponseEntity<List<LiveClassResponse>> listUpcoming() {
        return ResponseEntity.ok(liveClassService.getUpcomingClasses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get live class details")
    public ResponseEntity<LiveClassResponse> getClass(@PathVariable Long id) {
        return ResponseEntity.ok(liveClassService.getLiveClassById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Schedule a new live class (instructor only)")
    public ResponseEntity<LiveClassResponse> schedule(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(liveClassService.scheduleClass(body));
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Register for a live class")
    public ResponseEntity<String> register(@PathVariable Long id) {
        liveClassService.registerForClass(id);
        return ResponseEntity.ok("Registered for live class");
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Start a live class")
    public ResponseEntity<LiveClassResponse> startClass(@PathVariable Long id) {
        return ResponseEntity.ok(liveClassService.startClass(id));
    }
}
