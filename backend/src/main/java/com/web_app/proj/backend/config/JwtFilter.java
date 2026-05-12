package com.web_app.proj.backend.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // Routes publiques
        if (path.startsWith("/auth/")
                || path.startsWith("/ws")
                || path.startsWith("/topic/")
                || path.startsWith("/app/")
                || (request.getMethod().equals("GET") && path.startsWith("/game/"))) {

            filterChain.doFilter(request, response);
            return;
        }

        // Vérification du token
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String username = jwtUtils.extractUsername(token);
            request.setAttribute("username", username);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(username, null, List.of());

            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (Exception e) {
            System.out.println("JwtFilter exception: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

}
