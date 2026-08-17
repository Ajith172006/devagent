package com.devagent.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Value("${auth.bypass-firebase:false}")
    private boolean bypassFirebase;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        // Dev bypass — accepts x-user-id header directly (or uses default dev-local-user)
        if (bypassFirebase) {
            String devUid = request.getHeader("x-user-id");
            if (devUid == null || devUid.isBlank()) {
                devUid = "dev-local-user";
            }
            setAuth(devUid, "dev@local.mock");
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(token);
                setAuth(decoded.getUid(), decoded.getEmail());
            } catch (Exception e) {
                // Token invalid — let Spring Security handle the 401
            }
        }

        chain.doFilter(request, response);
    }

    private void setAuth(String uid, String email) {
        DevAgentPrincipal principal = new DevAgentPrincipal(uid, email);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
