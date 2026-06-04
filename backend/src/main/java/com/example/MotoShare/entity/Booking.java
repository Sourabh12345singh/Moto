package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Check(constraints = "total_price >= 0")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bike_id", nullable = false)
    private Bike bike;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "slot_id", nullable = false)
    private AvailabilitySlot slot;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "total_price", nullable = false)
    private Long totalPrice;

    /**
     * WHY add a persistent status enum?
     *
     * Before: Status was COMPUTED on-the-fly: endTime.isAfter(now) ? "UPCOMING" : "COMPLETED".
     * Problem: You can't write SQL queries like "SELECT * FROM bookings WHERE status = 'CANCELLED'"
     * because the status doesn't exist in the database — it only lives in Java memory.
     *
     * Cancellation is a user ACTION, not a time-derived property. It must be stored explicitly.
     * This enables: dashboard filters, analytics, refund processing, admin auditing.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    /**
     * WHY track when a booking was cancelled?
     *
     * For auditing, refund windows, and dispute resolution.
     * "Was this cancelled 5 minutes before the ride or 2 days before?"
     * Without this timestamp, you can never answer that question.
     */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    /**
     * WHY add @Version (Optimistic Locking) here?
     *
     * Scenario: Admin is processing a refund on booking #42.
     * Simultaneously, a scheduled job tries to mark booking #42 as COMPLETED.
     * Without @Version, the last write wins silently — the refund could be lost.
     *
     * With @Version, JPA checks if the version in memory matches the version in the DB.
     * If it doesn't (someone else modified it), it throws OptimisticLockException
     * instead of silently overwriting.
     *
     * WHY Optimistic here and Pessimistic on AvailabilitySlot?
     * - AvailabilitySlot booking = HIGH contention (50 users fighting for 1 slot) → Pessimistic
     * - Booking status updates = LOW contention (only owner/admin modifies) → Optimistic
     * Choosing the right lock type based on contention level is a key FAANG interview topic.
     */
    @Version
    private Long version;
}
