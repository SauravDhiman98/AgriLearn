package com.agrilearn.dto.response;

import com.agrilearn.entity.Product;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer stockQuantity;
    private String unit;
    private Product.ProductCategory category;
    private Product.ProductStatus status;
    private double rating;
    private SellerInfo seller;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class SellerInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String avatarUrl;
    }

    public static ProductResponse from(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .stockQuantity(p.getStockQuantity())
                .unit(p.getUnit())
                .category(p.getCategory())
                .status(p.getStatus())
                .rating(p.getRating())
                .seller(p.getSeller() != null ? SellerInfo.builder()
                        .id(p.getSeller().getId())
                        .firstName(p.getSeller().getFirstName())
                        .lastName(p.getSeller().getLastName())
                        .avatarUrl(p.getSeller().getAvatarUrl())
                        .build() : null)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
