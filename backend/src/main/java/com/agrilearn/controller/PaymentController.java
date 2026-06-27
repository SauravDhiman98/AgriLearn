package com.agrilearn.controller;

import com.agrilearn.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Razorpay UPI/Card payment integration")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Step 1 — Frontend calls this to get a Razorpay order_id before opening checkout.
     * Returns: { orderId, amount, currency, keyId }
     */
    @PostMapping("/create-order")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create Razorpay order for subscription plan")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, String> body) {
        String plan = body.get("plan");
        return ResponseEntity.ok(paymentService.createOrder(plan));
    }

    /**
     * Step 2 — Frontend calls this after user pays. Backend verifies signature, activates subscription.
     * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan }
     */
    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verify Razorpay payment and activate subscription")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(paymentService.verifyAndActivate(body));
    }
}
