package com.agrilearn.service;

import com.agrilearn.dto.response.SubscriptionResponse;

import java.util.List;

public interface SubscriptionService {
    List<?> getPlans();
    SubscriptionResponse getMySubscription();
    SubscriptionResponse createSubscription(String plan);
    void handleWebhook(String payload, String signature);
    void cancelSubscription();
}
