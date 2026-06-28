package com.agrilearn.controller;

import com.agrilearn.entity.FeatureFlag;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.FeatureFlagRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Feature Flags", description = "Feature toggle management")
public class FeatureFlagController {

    private final FeatureFlagRepository featureFlagRepository;

    /** Public endpoint — frontend calls this on load to know which features are enabled */
    @GetMapping("/config/features")
    @Operation(summary = "Get all feature flags (public)")
    public ResponseEntity<Map<String, Boolean>> getFeatureFlags() {
        Map<String, Boolean> flags = featureFlagRepository.findAll()
                .stream()
                .collect(Collectors.toMap(FeatureFlag::getFeatureKey, FeatureFlag::isEnabled));
        return ResponseEntity.ok(flags);
    }

    /** Admin — list all flags with descriptions */
    @GetMapping("/admin/features")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all feature flags with details (admin)")
    public ResponseEntity<List<FeatureFlag>> listFlags() {
        return ResponseEntity.ok(featureFlagRepository.findAll());
    }

    /** Admin — toggle a single flag on/off */
    @PutMapping("/admin/features/{featureKey}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enable or disable a feature flag (admin)")
    public ResponseEntity<FeatureFlag> updateFlag(
            @PathVariable String featureKey,
            @RequestBody Map<String, Object> body) {
        FeatureFlag flag = featureFlagRepository.findByFeatureKey(featureKey)
                .orElseThrow(() -> new ResourceNotFoundException("Feature flag not found: " + featureKey));
        flag.setEnabled(Boolean.TRUE.equals(body.get("enabled")));
        flag.setUpdatedAt(LocalDateTime.now());
        if (body.containsKey("description")) {
            flag.setDescription((String) body.get("description"));
        }
        return ResponseEntity.ok(featureFlagRepository.save(flag));
    }
}
