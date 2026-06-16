package com.agrilearn.controller;

import com.agrilearn.dto.response.SubscriptionResponse;
import com.agrilearn.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "Free and premium subscription management")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    @Operation(summary = "Get available subscription plans")
    public ResponseEntity<List<?>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getPlans());
    }

    @GetMapping("/my-subscription")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's subscription")
    public ResponseEntity<SubscriptionResponse> getMySubscription() {
        return ResponseEntity.ok(subscriptionService.getMySubscription());
    }

    @PostMapping("/subscribe")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Subscribe to a plan")
    public ResponseEntity<SubscriptionResponse> subscribe(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(subscriptionService.createSubscription(body.get("plan")));
    }

    @PostMapping("/webhook/razorpay")
    @Operation(summary = "Razorpay payment webhook (internal)")
    public ResponseEntity<String> razorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        subscriptionService.handleWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel current subscription")
    public ResponseEntity<String> cancel() {
        subscriptionService.cancelSubscription();
        return ResponseEntity.ok("Subscription cancelled");
    }
}
