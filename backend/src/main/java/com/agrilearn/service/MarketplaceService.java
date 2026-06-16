package com.agrilearn.service;

import com.agrilearn.dto.response.OrderResponse;
import com.agrilearn.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface MarketplaceService {
    Page<ProductResponse> listProducts(String category, String keyword, Pageable pageable);
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(Map<String, Object> body);
    OrderResponse checkout(Map<String, Object> body);
    Page<OrderResponse> getMyOrders(Pageable pageable);
    OrderResponse getOrderByNumber(String orderNumber);
}
