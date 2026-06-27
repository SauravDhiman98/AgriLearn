package com.agrilearn.service.impl;

import com.agrilearn.entity.Subscription;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.SubscriptionRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;

@Service
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    private static final Map<String, Integer> PLAN_AMOUNT_PAISE = Map.of(
            "PREMIUM", 29900,   // ₹299 in paise
            "ANNUAL",  249900   // ₹2499 in paise
    );

    public PaymentServiceImpl(UserRepository userRepository,
                               SubscriptionRepository subscriptionRepository) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Override
    public Map<String, Object> createOrder(String planName) {
        if (planName == null || planName.equalsIgnoreCase("FREE")) {
            throw new BadRequestException("FREE plan does not require payment");
        }
        String upper = planName.toUpperCase();
        if (!PLAN_AMOUNT_PAISE.containsKey(upper)) {
            throw new BadRequestException("Invalid plan: " + planName);
        }
        int amountPaise = PLAN_AMOUNT_PAISE.get(upper);
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject orderReq = new JSONObject();
            orderReq.put("amount", amountPaise);
            orderReq.put("currency", "INR");
            orderReq.put("receipt", "order_" + System.currentTimeMillis());
            orderReq.put("payment_capture", 1);
            Order order = client.orders.create(orderReq);
            log.info("Razorpay order created: {}", order.toString());
            return Map.of(
                    "orderId", (String) order.get("id"),
                    "amount", amountPaise,
                    "currency", "INR",
                    "keyId", keyId
            );
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order", e);
            throw new BadRequestException("Payment gateway error: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> verifyAndActivate(Map<String, String> payload) {
        String razorpayOrderId   = payload.get("razorpayOrderId");
        String razorpayPaymentId = payload.get("razorpayPaymentId");
        String razorpaySignature = payload.get("razorpaySignature");
        String planName          = payload.get("plan");

        // Verify HMAC-SHA256 signature
        if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            throw new BadRequestException("Payment verification failed: invalid signature");
        }

        // Activate subscription
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Subscription.Plan plan;
        try {
            plan = Subscription.Plan.valueOf(planName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid plan: " + planName);
        }

        // Cancel existing subscription
        subscriptionRepository.findByUserId(user.getId()).ifPresent(existing -> {
            existing.setStatus(Subscription.SubscriptionStatus.CANCELLED);
            existing.setAutoRenew(false);
            subscriptionRepository.save(existing);
        });

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = plan == Subscription.Plan.ANNUAL ? now.plusYears(1) : now.plusMonths(1);
        int paise = PLAN_AMOUNT_PAISE.getOrDefault(plan.name(), 0);

        Subscription sub = Subscription.builder()
                .user(user)
                .plan(plan)
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .startDate(now)
                .endDate(end)
                .razorpayPaymentId(razorpayPaymentId)
                .amountPaid(BigDecimal.valueOf(paise / 100.0))
                .build();

        subscriptionRepository.save(sub);
        log.info("Subscription activated for {} → plan={} payment={}", email, plan, razorpayPaymentId);

        return Map.of(
                "success", true,
                "plan", plan.name(),
                "endDate", end.toString()
        );
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error", e);
            return false;
        }
    }
}
