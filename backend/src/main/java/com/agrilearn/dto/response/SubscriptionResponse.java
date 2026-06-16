package com.agrilearn.dto.response;

import com.agrilearn.entity.Subscription;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionResponse {
    private Long id;
    private Subscription.Plan plan;
    private Subscription.SubscriptionStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal amountPaid;
    private boolean autoRenew;
    private LocalDateTime createdAt;

    public static SubscriptionResponse from(Subscription s) {
        return SubscriptionResponse.builder()
                .id(s.getId())
                .plan(s.getPlan())
                .status(s.getStatus())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .amountPaid(s.getAmountPaid())
                .autoRenew(s.isAutoRenew())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
