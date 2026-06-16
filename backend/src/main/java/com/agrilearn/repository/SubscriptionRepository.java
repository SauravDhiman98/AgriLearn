package com.agrilearn.repository;

import com.agrilearn.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserId(Long userId);
    boolean existsByUserIdAndStatus(Long userId, Subscription.SubscriptionStatus status);
}
