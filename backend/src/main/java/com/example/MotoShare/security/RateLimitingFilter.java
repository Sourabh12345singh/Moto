package com.example.MotoShare.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Servlet filter that intercepts all incoming API requests and runs them through our
 * custom Token Bucket rate limiter.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String clientIp = getClientIp(request);

        // Run client IP through the rate limiter
        if (!rateLimiter.allowRequest(clientIp)) {
            log.warn("Rate limit breached by IP: {} on URL: {}", clientIp, request.getRequestURI());
            
            // Halt request processing and write structured HTTP 429 JSON response
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> errorPayload = new HashMap<>();
            errorPayload.put("timestamp", LocalDateTime.now().toString());
            errorPayload.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
            errorPayload.put("error", "Too Many Requests");
            errorPayload.put("message", "API rate limit exceeded. You have initiated too many requests in a short time frame. Please slow down.");
            errorPayload.put("path", request.getRequestURI());

            objectMapper.writeValue(response.getWriter(), errorPayload);
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the real client IP, resolving proxies and load balancers using standard HTTP headers.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain a comma-separated list of IPs. The first one is the client.
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp.trim();
        }
        
        return request.getRemoteAddr();
    }
}
