package com.hospital.config;

import com.hospital.security.CustomUserDetailsService;
import com.hospital.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configure(http))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/ai/health", "/api/ai/predict/symptom").permitAll()
                .requestMatchers("/api/ai/**").hasAnyRole("STAFF", "ADMIN", "DOCTOR")
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/files/**").hasAnyRole("LAB_TECHNICIAN", "DOCTOR", "STAFF", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/queues/room/**", "/api/queues/lookup", "/api/queues/lookup/**", "/api/departments", "/api/departments/**", "/api/doctors", "/api/doctors/**", "/api/catalog", "/api/catalog/**").permitAll()
                .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()
                .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/departments", "/api/departments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/departments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/catalog/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/catalog/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/catalog/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/billing/invoices/my").hasRole("PATIENT")
                .requestMatchers(HttpMethod.POST, "/api/billing/invoices/*/pay").hasAnyRole("PATIENT", "STAFF", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/billing/invoices", "/api/billing/invoices/sync/*").hasAnyRole("STAFF", "ADMIN", "DOCTOR")
                .requestMatchers("/api/billing/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/stats/**").hasAnyRole("ADMIN", "STAFF", "DOCTOR")
                .requestMatchers(HttpMethod.GET, "/api/settings", "/api/settings/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/settings", "/api/settings/**").hasRole("ADMIN")
                .requestMatchers("/api/triage/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/lab-orders/my").hasRole("PATIENT")
                .requestMatchers("/api/lab-orders/**").hasAnyRole("LAB_TECHNICIAN", "DOCTOR", "STAFF", "ADMIN")
                .requestMatchers("/api/pharmacy/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/api/staff/**").hasRole("STAFF")
                .requestMatchers("/api/lab/**").hasRole("LAB_TECHNICIAN")
                .requestMatchers("/api/patient/**").hasRole("PATIENT")
                .requestMatchers("/api/appointments/**", "/api/departments/**", "/api/queues/**", "/api/users/**").authenticated()
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                );
    }
}
