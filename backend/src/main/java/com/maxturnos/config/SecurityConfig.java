package com.maxturnos.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maxturnos.dto.ApiResponse;
import com.maxturnos.security.AccessControlManager;
import com.maxturnos.security.AccessControlService;
import com.maxturnos.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AccessControlManager accessControlManager;
    private final AccessControlService accessControlService;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          AccessControlManager accessControlManager,
                          AccessControlService accessControlService,
                          ObjectMapper objectMapper) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.accessControlManager = accessControlManager;
        this.accessControlService = accessControlService;
        this.objectMapper = objectMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(this::isPublicRequest).permitAll()
                .anyRequest().access(accessControlManager)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(this::unauthorized)
                .accessDeniedHandler(this::forbidden)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private boolean isPublicRequest(HttpServletRequest request) {
        return accessControlService.isPublicRequest(request);
    }

    private void unauthorized(HttpServletRequest request,
                              HttpServletResponse response,
                              org.springframework.security.core.AuthenticationException ex) throws IOException {
        writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "No autorizado");
    }

    private void forbidden(HttpServletRequest request,
                           HttpServletResponse response,
                           org.springframework.security.access.AccessDeniedException ex) throws IOException {
        writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, "No tenés permiso para realizar esta acción");
    }

    private void writeJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), ApiResponse.error(message));
    }
}
