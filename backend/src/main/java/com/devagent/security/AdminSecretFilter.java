package com.devagent.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Protects all /admin/** endpoints using a shared secret header.
 * Runs before FirebaseTokenFilter so admin routes never need a Firebase token.
 */
@Component
public class AdminSecretFilter extends OncePerRequestFilter {

    @Value("${admin.secret:}")
    private String adminSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/admin")) {
            chain.doFilter(request, response);
            return;
        }

        if (adminSecret == null || adminSecret.isBlank()) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.getWriter().write("{\"message\":\"ADMIN_SECRET is not configured\"}");
            return;
        }

        String provided = request.getHeader("x-admin-secret");
        if (provided == null || !provided.equals(adminSecret)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Invalid admin secret\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
