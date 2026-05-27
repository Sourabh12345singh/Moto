package com.example.MotoShare.service.notification;

import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.entity.Booking;
import com.example.MotoShare.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Strategy implementation simulating SMS notifications.
 * Demonstrates clean extension of notification strategies without modifying core booking code.
 */
@Component
@Slf4j
public class SmsNotificationStrategy implements NotificationStrategy {

    @Override
    public void sendBookingConfirmation(User taker, Bike bike, AvailabilitySlot slot, Booking booking) {
        String bikeName = bike.getCompany() + " " + bike.getModel();
        
        // Simulating SMS sending by logging it
        log.info("[SMS SENT to TAKER - {}]: Hello {}, your booking for {} in {} is confirmed! Total: Rs {}.",
                taker.getEmail(), // Simulating recipient phone/email identifier
                taker.getName(),
                bikeName,
                slot.getCity(),
                booking.getTotalPrice()
        );
    }

    @Override
    public void sendBookingNotification(User biker, User taker, Bike bike, AvailabilitySlot slot, Booking booking) {
        String bikeName = bike.getCompany() + " " + bike.getModel();
        
        // Simulating SMS sending by logging it
        log.info("[SMS SENT to BIKER - {}]: Hello {}, your bike {} has been booked by {} from {} to {}.",
                biker.getEmail(),
                biker.getName(),
                bikeName,
                taker != null ? taker.getName() : "a rider",
                booking.getStartTime(),
                booking.getEndTime()
        );
    }
}
