package com.agrilearn.repository;

import com.agrilearn.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByBuyerId(Long buyerId, Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);
}
