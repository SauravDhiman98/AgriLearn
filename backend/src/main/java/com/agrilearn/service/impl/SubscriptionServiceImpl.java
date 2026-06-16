package com.agrilearn.service.impl;

import com.agrilearn.dto.response.SubscriptionResponse;
import com.agrilearn.entity.Subscription;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.SubscriptionRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    private static final Map<String, BigDecimal> PLAN_PRICES = Map.of(
            "FREE",    BigDecimal.ZERO,
            "BASIC",   new BigDecimal("199"),
            "PREMIUM", new BigDecimal("499"),
            "ANNUAL",  new BigDecimal("3999")
    );

    @Override
    public List<?> getPlans() {
        return List.of(
                Map.of("plan", "FREE",    "price", 0,    "duration", "Unlimited",
                        "features", List.of("5 free courses", "Community forum access", "Basic marketplace")),
                Map.of("plan", "BASIC",   "price", 199,  "duration", "Monthly",
                        "features", List.of("50+ courses", "Live class recordings", "Certificate of completion", "All free features")),
                Map.of("plan", "PREMIUM", "price", 499,  "duration", "Monthly",
                        "features", List.of("500+ courses", "Live classes", "Certificate", "Priority support", "Marketplace seller")),
                Map.of("plan", "ANNUAL",  "price", 3999, "duration", "Annual",
                        "features", List.of("Everything in Premium", "Save 33%", "Offline downloads", "Exclusive webinars", "1-on-1 mentoring"))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getMySubscription() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return subscriptionRepository.findByUserId(user.getId())
                .map(SubscriptionResponse::from)
                .orElse(null);
    }

    @Override
    public SubscriptionResponse createSubscription(String planName) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Subscription.Plan plan;
        try {
            plan = Subscription.Plan.valueOf(planName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid plan: " + planName + ". Valid values: FREE, BASIC, PREMIUM, ANNUAL");
        }

        // Cancel any existing active subscription
        subscriptionRepository.findByUserId(user.getId()).ifPresent(existing -> {
            existing.setStatus(Subscription.SubscriptionStatus.CANCELLED);
            existing.setAutoRenew(false);
            subscriptionRepository.save(existing);
        });

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = plan == Subscription.Plan.ANNUAL ? now.plusYears(1) : now.plusMonths(1);

        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .startDate(now)
                .endDate(end)
                .amountPaid(PLAN_PRICES.getOrDefault(plan.name(), BigDecimal.ZERO))
                .build();

        // TODO: Integrate Razorpay for BASIC/PREMIUM/ANNUAL plans — create payment order and return payment link
        log.info("Subscription created for user {} with plan {}", email, plan);
        return SubscriptionResponse.from(subscriptionRepository.save(subscription));
    }

    @Override
    public void handleWebhook(String payload, String signature) {
        // TODO: Verify Razorpay HMAC-SHA256 webhook signature and update subscription/payment status
        log.info("Received Razorpay webhook (signature verification pending)");
    }

    @Override
    public void cancelSubscription() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var subscription = subscriptionRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No active subscription found"));
        if (subscription.getStatus() == Subscription.SubscriptionStatus.CANCELLED) {
            throw new BadRequestException("Subscription is already cancelled");
        }
        subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
        subscription.setAutoRenew(false);
        subscriptionRepository.save(subscription);
    }
}
