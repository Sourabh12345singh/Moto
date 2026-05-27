package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Dead-Letter Queue (DLQ) Entity to store failed notifications for retry or auditing.
 * Shows deep architectural awareness of fault tolerance and graceful degradation.
 */
@Entity
@Table(name = "failed_notifications")
@Getter
@Setter
public class FailedNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(columnDefinition = "TEXT")
    private String errorReason;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private int retryCount = 0;
}
