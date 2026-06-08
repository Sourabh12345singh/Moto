package com.example.MotoShare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Custom Thread Pool Configuration for Asynchronous Tasks (Bulkhead Pattern).
 * Isolates resource-heavy async tasks (like notifications/emails) from the main request threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);          // Bounded core thread count
        executor.setMaxPoolSize(10);          // Max concurrent threads
        executor.setQueueCapacity(50);        // Bounded queue to avoid OutOfMemoryError under high load
        executor.setThreadNamePrefix("async-notification-");
        
        // Rejection Policy: CallerRunsPolicy runs the task on the calling thread if the thread pool is saturated.
        // This prevents task loss and acts as a backpressure mechanism to slow down caller threads.
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        executor.initialize();
        return executor;
    }
}
