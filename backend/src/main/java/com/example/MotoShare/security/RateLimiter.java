package com.example.MotoShare.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

/**
 * A high-performance, thread-safe, in-memory Token Bucket Rate Limiter.
 * Designed to prevent memory leaks by periodically evicting inactive client buckets.
 */
@Component
@Slf4j
public class RateLimiter {

    // Default configuration: Max 10 requests burst capacity, refilling 2 tokens per second
    private static final long BUCKET_CAPACITY = 10;
    private static final long REFILL_TOKENS_PER_SECOND = 2;
    private static final long INACTIVE_EVICTION_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes of inactivity

    private final ConcurrentHashMap<String, TokenBucket> ipBuckets = new ConcurrentHashMap<>();

    /**
     * Attempts to consume 1 token for a given IP address.
     *
     * @param ipAddress The client's IP address.
     * @return true if token was consumed (request allowed), false if rate-limited.
     */
    public boolean allowRequest(String ipAddress) {
        TokenBucket bucket = ipBuckets.computeIfAbsent(ipAddress, 
                ip -> new TokenBucket(BUCKET_CAPACITY, REFILL_TOKENS_PER_SECOND));
        return bucket.tryConsume();
    }

    /**
     * Periodic cleanup task running every 5 minutes to evict inactive buckets,
     * protecting the server from memory exhaustion / Memory Leak attacks.
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void cleanupInactiveBuckets() {
        long now = System.currentTimeMillis();
        int initialSize = ipBuckets.size();
        
        ipBuckets.entrySet().removeIf(entry -> 
            (now - entry.getValue().getLastAccessTimestamp()) > INACTIVE_EVICTION_THRESHOLD_MS
        );
        
        int cleanedCount = initialSize - ipBuckets.size();
        if (cleanedCount > 0) {
            log.info("RateLimiter Cache Eviction: Removed {} inactive rate-limiting buckets. Active buckets: {}", 
                    cleanedCount, ipBuckets.size());
        }
    }

    /**
     * Represents a single client's Token Bucket.
     */
    private static class TokenBucket {
        private final long capacity;
        private final double refillRatePerMs;
        
        private double tokens;
        private long lastRefillTimestamp;
        private volatile long lastAccessTimestamp;

        public TokenBucket(long capacity, long refillTokensPerSecond) {
            this.capacity = capacity;
            this.refillRatePerMs = refillTokensPerSecond / 1000.0;
            this.tokens = capacity;
            this.lastRefillTimestamp = System.currentTimeMillis();
            this.lastAccessTimestamp = System.currentTimeMillis();
        }

        /**
         * Thread-safe token consumption using Java's monitor lock.
         */
        public synchronized boolean tryConsume() {
            long now = System.currentTimeMillis();
            lastAccessTimestamp = now;
            
            // 1. Calculate refilled tokens since last access
            long elapsed = now - lastRefillTimestamp;
            if (elapsed > 0) {
                double refilled = elapsed * refillRatePerMs;
                tokens = Math.min(capacity, tokens + refilled);
                lastRefillTimestamp = now;
            }

            // 2. Consume token if available
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        public long getLastAccessTimestamp() {
            return this.lastAccessTimestamp;
        }
    }
}
