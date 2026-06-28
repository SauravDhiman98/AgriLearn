package com.agrilearn.repository;

import com.agrilearn.entity.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, Long> {
    Optional<FeatureFlag> findByFeatureKey(String featureKey);
}
