package com.agrilearn.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * Creates the DataSource manually so we can handle both:
 *  - Railway: DATABASE_URL env var = postgresql://user:pass@host:port/db
 *  - Local dev: individual DB_URL / DB_USERNAME / DB_PASSWORD env vars
 *
 * Spring Boot's @ConditionalOnProperty doesn't match raw OS env vars reliably,
 * so we do the check programmatically inside the bean method.
 */
@Configuration
@Slf4j
public class DataSourceConfig {

    // Railway injects DATABASE_URL as OS env var
    @Value("#{systemEnvironment['DATABASE_URL'] ?: ''}")
    private String databaseUrl;

    @Value("${DB_URL:jdbc:postgresql://localhost:5432/agrilearn}")
    private String dbUrl;

    @Value("${DB_USERNAME:agrilearn}")
    private String dbUsername;

    @Value("${DB_PASSWORD:agrilearn123}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource primaryDataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setMaximumPoolSize(10);
        ds.setMinimumIdle(2);
        ds.setConnectionTimeout(30000);
        ds.setDriverClassName("org.postgresql.Driver");

        if (databaseUrl != null && !databaseUrl.isBlank()) {
            // Railway: parse postgresql://user:pass@host:port/db
            log.info("DATABASE_URL detected — using Railway PostgreSQL");
            String clean = databaseUrl
                    .replace("postgresql://", "")
                    .replace("postgres://", "");

            String userInfo = clean.substring(0, clean.indexOf('@'));
            String hostAndDb = clean.substring(clean.indexOf('@') + 1);

            String username = userInfo.contains(":") ? userInfo.split(":", 2)[0] : userInfo;
            String password = userInfo.contains(":") ? userInfo.split(":", 2)[1] : "";

            ds.setJdbcUrl("jdbc:postgresql://" + hostAndDb);
            ds.setUsername(username);
            ds.setPassword(password);
            log.info("JDBC URL: jdbc:postgresql://{}", hostAndDb);
        } else {
            // Local dev
            log.info("No DATABASE_URL — using local datasource: {}", dbUrl);
            ds.setJdbcUrl(dbUrl);
            ds.setUsername(dbUsername);
            ds.setPassword(dbPassword);
        }

        return ds;
    }
}
