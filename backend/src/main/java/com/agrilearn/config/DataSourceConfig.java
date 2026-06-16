package com.agrilearn.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Handles Railway's native DATABASE_URL format: postgresql://user:pass@host:port/db
 * Spring needs jdbc:postgresql:// prefix with credentials split out.
 * This bean is only active when DATABASE_URL is set (i.e. on Railway).
 */
@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    @ConditionalOnProperty(name = "DATABASE_URL")
    public DataSource railwayDataSource() {
        try {
            // Railway provides: postgresql://user:pass@host:port/db
            // Convert to: jdbc:postgresql://host:port/db
            String cleanUrl = databaseUrl
                    .replace("postgresql://", "")
                    .replace("postgres://", "");

            // Parse out credentials and host
            String userInfo = cleanUrl.substring(0, cleanUrl.indexOf('@'));
            String hostAndDb = cleanUrl.substring(cleanUrl.indexOf('@') + 1);

            String username = userInfo.contains(":") ? userInfo.split(":", 2)[0] : userInfo;
            String password = userInfo.contains(":") ? userInfo.split(":", 2)[1] : "";

            String jdbcUrl = "jdbc:postgresql://" + hostAndDb;

            log.info("Connecting to Railway PostgreSQL at: jdbc:postgresql://{}",
                    hostAndDb.replaceAll(":.*@", ":***@")); // mask password in logs

            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(jdbcUrl);
            ds.setUsername(username);
            ds.setPassword(password);
            ds.setMaximumPoolSize(10);
            ds.setMinimumIdle(2);
            ds.setConnectionTimeout(30000);
            ds.setDriverClassName("org.postgresql.Driver");
            return ds;

        } catch (Exception e) {
            log.error("Failed to parse DATABASE_URL: {}", e.getMessage());
            throw new RuntimeException("Invalid DATABASE_URL: " + e.getMessage(), e);
        }
    }
}
