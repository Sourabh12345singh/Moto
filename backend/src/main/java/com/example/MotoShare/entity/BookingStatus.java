package com.example.MotoShare.entity;

/**
 * Booking lifecycle states.
 *
 * WHY a persistent enum instead of computing status from timestamps?
 * 1. You can't query "give me all cancelled bookings" if status only exists in Java memory.
 * 2. Computed status breaks if the server clock is wrong or the user disputes mid-ride.
 * 3. Cancellation is a user ACTION, not a time-derived property — it must be recorded explicitly.
 *
 * State Machine:
 *   CONFIRMED → CANCELLED  (user cancels before ride)
 *   CONFIRMED → COMPLETED  (ride time passes — future scheduled job or manual transition)
 */
public enum BookingStatus {
    CONFIRMED,
    CANCELLED,
    COMPLETED
}
