package com.example.MotoShare.service.notification;

import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.entity.Booking;
import com.example.MotoShare.entity.User;

/**
 * Strategy interface for sending notifications.
 * Demonstrates the OOPS Strategy Pattern and SOLID Open/Closed Principle (OCP).
 */
public interface NotificationStrategy {

    /**
     * Sends booking confirmation to the Taker who rented the bike.
     */
    void sendBookingConfirmation(User taker, Bike bike, AvailabilitySlot slot, Booking booking);

    /**
     * Sends booking notification to the Biker who owns the bike.
     */
    void sendBookingNotification(User biker, User taker, Bike bike, AvailabilitySlot slot, Booking booking);
}
