package com.agrilearn.config;

import com.agrilearn.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    private static final String[] PUBLIC_ENDPOINTS = {
        "/auth/**",
        "/track/**",                 // analytics tracking — no auth needed
        "/files/**",                 // local dev file serving
        "/files/proxy/**",           // proxied B2/MinIO file downloads        "/courses/public/**",
        "/forum/posts/public/**",
        "/marketplace/products/public/**",
        "/quizzes/course/**",
        "/actuator/health",
        "/actuator/health/**",
        "/actuator/info",
        "/swagger-ui/**",
        "/api-docs/**",
        "/v3/api-docs/**",
        // React SPA static assets
        "/", "/index.html", "/assets/**", "/*.js", "/*.css",
        "/*.ico", "/*.png", "/*.svg", "/*.webmanifest",
        // Notes PDF viewer — auth checked inside controller; permitAll so
        // Security doesn't block before CORS headers are applied (fixes 403 on mobile)
        // Note: context-path is /api/v1, so Security sees the full path
        "/notes/*/view",
        "/api/v1/notes/*/view"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .headers(h -> h.frameOptions(f -> f.sameOrigin()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        // CSV template downloads — no sensitive data, no auth needed
                        .requestMatchers(HttpMethod.GET, "/admin/mcq/template", "/admin/exam-info/template").permitAll()
                        // Razorpay webhook — no auth, signature verified in service
                        .requestMatchers(HttpMethod.POST, "/subscriptions/webhook/razorpay").permitAll()
                        // Subscription plans + feature flags — public
                        .requestMatchers(HttpMethod.GET, "/subscriptions/plans", "/config/features").permitAll()
                        // SPA routes — serve index.html, auth handled client-side
                        .requestMatchers(HttpMethod.GET, "/login", "/register", "/dashboard",
                                "/profile", "/forum/**", "/marketplace/**",
                                "/live-classes", "/mcq-tests/**", "/instructor/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/exams/*/sections").permitAll()
                        .requestMatchers("/exams/**", "/subjects/**", "/exam-chapters/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
