package com.agrilearn.controller;

import com.agrilearn.dto.response.OrderResponse;
import com.agrilearn.dto.response.ProductResponse;
import com.agrilearn.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/marketplace")
@RequiredArgsConstructor
@Tag(name = "Marketplace", description = "Agriculture product marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/products/public")
    @Operation(summary = "List products (public)")
    public ResponseEntity<Page<ProductResponse>> listProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(marketplaceService.listProducts(category, keyword, pageable));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get product details")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getProductById(id));
    }

    @PostMapping("/products")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List a new product")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketplaceService.createProduct(body));
    }

    @PostMapping("/cart/checkout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Checkout and create an order")
    public ResponseEntity<OrderResponse> checkout(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketplaceService.checkout(body));
    }

    @GetMapping("/orders")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<Page<OrderResponse>> getOrders(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(marketplaceService.getMyOrders(pageable));
    }

    @GetMapping("/orders/{orderNumber}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get order details")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(marketplaceService.getOrderByNumber(orderNumber));
    }
}
