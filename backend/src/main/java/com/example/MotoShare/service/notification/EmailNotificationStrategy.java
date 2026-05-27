package com.example.MotoShare.service.notification;

import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.entity.Booking;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Strategy implementation for sending email notifications.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationStrategy implements NotificationStrategy {

    private final EmailService emailService;

    @Override
    public void sendBookingConfirmation(User taker, Bike bike, AvailabilitySlot slot, Booking booking) {
        String bikeName = bike.getCompany() + " " + bike.getModel();
        log.info("Dispatching Email notification to Taker: {}", taker.getEmail());
        
        emailService.sendBookingConfirmationToTaker(
                taker.getEmail(),
                taker.getName(),
                bikeName,
                slot.getCity(),
                slot.getPickupLocation(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalPrice()
        );
    }

    @Override
    public void sendBookingNotification(User biker, User taker, Bike bike, AvailabilitySlot slot, Booking booking) {
        String bikeName = bike.getCompany() + " " + bike.getModel();
        log.info("Dispatching Email notification to Biker: {}", biker.getEmail());
        
        emailService.sendBookingNotificationToBiker(
                biker.getEmail(),
                biker.getName(),
                bikeName,
                taker != null ? taker.getName() : "A rider",
                taker != null ? taker.getEmail() : "",
                slot.getCity(),
                slot.getPickupLocation(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalPrice()
        );
    }
}
