package com.agrilearn.service.impl;

import com.agrilearn.dto.response.OrderResponse;
import com.agrilearn.dto.response.ProductResponse;
import com.agrilearn.entity.Order;
import com.agrilearn.entity.OrderItem;
import com.agrilearn.entity.Product;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.OrderRepository;
import com.agrilearn.repository.ProductRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MarketplaceServiceImpl implements MarketplaceService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> listProducts(String category, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return productRepository.searchProducts(keyword, pageable).map(ProductResponse::from);
        }
        if (category != null && !category.isBlank()) {
            try {
                return productRepository.findByStatusAndCategory(
                        Product.ProductStatus.ACTIVE,
                        Product.ProductCategory.valueOf(category.toUpperCase()),
                        pageable).map(ProductResponse::from);
            } catch (IllegalArgumentException ignored) {}
        }
        return productRepository.findByStatus(Product.ProductStatus.ACTIVE, pageable).map(ProductResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return ProductResponse.from(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id)));
    }

    @Override
    public ProductResponse createProduct(Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String name = (String) body.get("name");
        if (name == null || name.isBlank()) throw new BadRequestException("Product name is required");
        if (body.get("price") == null) throw new BadRequestException("Product price is required");

        BigDecimal price = new BigDecimal(body.get("price").toString());
        String categoryStr = (String) body.getOrDefault("category", "OTHER");

        Product.ProductCategory category;
        try {
            category = Product.ProductCategory.valueOf(categoryStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid category: " + categoryStr);
        }

        Integer stock = body.containsKey("stockQuantity")
                ? Integer.parseInt(body.get("stockQuantity").toString()) : null;

        Product product = Product.builder()
                .name(name)
                .description((String) body.get("description"))
                .price(price)
                .category(category)
                .stockQuantity(stock)
                .unit((String) body.get("unit"))
                .seller(seller)
                .build();
        ProductResponse response = ProductResponse.from(productRepository.save(product));
        log.info("Product listed: '{}' (id={}) by seller '{}' at ₹{}", name, response.getId(), email, price);
        return response;
    }

    @Override
    public OrderResponse checkout(Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        if (items == null || items.isEmpty()) throw new BadRequestException("Cart is empty");

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map<String, Object> item : items) {
            Long productId = Long.valueOf(item.get("productId").toString());
            int quantity = Integer.parseInt(item.get("quantity").toString());
            if (quantity < 1) throw new BadRequestException("Quantity must be at least 1");

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
            if (product.getStatus() != Product.ProductStatus.ACTIVE) {
                throw new BadRequestException("Product '" + product.getName() + "' is not available");
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(itemTotal);
            orderItems.add(OrderItem.builder()
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .totalPrice(itemTotal)
                    .build());
        }

        Order order = Order.builder()
                .orderNumber("AGR-" + Instant.now().toEpochMilli())
                .buyer(buyer)
                .totalAmount(total)
                .shippingAddress((String) body.get("shippingAddress"))
                .build();
        orderItems.forEach(i -> i.setOrder(order));
        order.setItems(orderItems);
        OrderResponse response = OrderResponse.from(orderRepository.save(order));
        log.info("Order '{}' created for user '{}' — ₹{} ({} items)",
                order.getOrderNumber(), email, total, orderItems.size());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByBuyerId(buyer.getId(), pageable).map(OrderResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        return OrderResponse.from(orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber)));
    }
}
