package com.agrilearn.service;

import java.util.Map;

public interface PaymentService {
    Map<String, Object> createOrder(String plan);
    Map<String, Object> verifyAndActivate(Map<String, String> payload);
}
