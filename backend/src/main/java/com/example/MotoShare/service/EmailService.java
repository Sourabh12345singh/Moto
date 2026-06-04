package com.example.MotoShare.service;

import com.example.MotoShare.entity.FailedNotification;
import com.example.MotoShare.repository.FailedNotificationRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Resilient, thread-isolated Email notification service.
 * Implements Exponential Backoff Retry and a database-backed Dead-Letter Queue (DLQ) for fault tolerance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final FailedNotificationRepository failedNotificationRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    
    // Resilience settings: Max 3 retry attempts with exponential backoff
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 1000;

    /**
     * Public async method to send booking confirmation to the Taker.
     */
    @Async
    public void sendBookingConfirmationToTaker(
            String takerEmail, String takerName,
            String bikeName, String city, String pickupLocation,
            LocalDateTime startTime, LocalDateTime endTime, long totalPrice
    ) {
        String subject = "MotoShare - Booking Confirmed!";
        String body = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>"
                + "<h2 style='color:#4F46E5'>Booking Confirmed!</h2>"
                + "<p>Hi " + takerName + ",</p>"
                + "<p>Your bike booking has been confirmed. Here are the details:</p>"
                + "<table style='width:100%;border-collapse:collapse;margin:16px 0'>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Bike</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee;font-weight:bold'>" + bikeName + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>City</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + city + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Pickup Location</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + pickupLocation + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Start</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + startTime.format(FMT) + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>End</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + endTime.format(FMT) + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Total Price</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee;font-weight:bold;color:#16A34A'>Rs " + totalPrice + "</td></tr>"
                + "</table>"
                + "<p style='color:#666;font-size:13px'>Please arrive at the pickup location on time. Carry a valid ID for verification.</p>"
                + "<p style='margin-top:24px'>Happy riding!<br><strong>Team MotoShare</strong></p>"
                + "</div>";

        sendWithRetryAndFallback(takerEmail, subject, body);
    }

    /**
     * Public async method to send booking notifications to the Biker.
     */
    @Async
    public void sendBookingNotificationToBiker(
            String bikerEmail, String bikerName,
            String bikeName, String takerName, String takerEmail,
            String city, String pickupLocation,
            LocalDateTime startTime, LocalDateTime endTime, long totalPrice
    ) {
        String subject = "MotoShare - New Booking for Your Bike!";
        String body = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>"
                + "<h2 style='color:#16A34A'>New Booking Received!</h2>"
                + "<p>Hi " + bikerName + ",</p>"
                + "<p>Great news! Someone has booked your bike. Here are the details:</p>"
                + "<table style='width:100%;border-collapse:collapse;margin:16px 0'>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Bike</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee;font-weight:bold'>" + bikeName + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Rider</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + takerName + " (" + takerEmail + ")</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>City</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + city + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Pickup Location</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + pickupLocation + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Start</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + startTime.format(FMT) + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>End</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee'>" + endTime.format(FMT) + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee;color:#666'>Earnings</td>"
                + "<td style='padding:8px;border-bottom:1px solid #eee;font-weight:bold;color:#16A34A'>Rs " + totalPrice + "</td></tr>"
                + "</table>"
                + "<p style='color:#666;font-size:13px'>Please ensure the bike is ready at the pickup location before the start time.</p>"
                + "<p style='margin-top:24px'>Keep earning!<br><strong>Team MotoShare</strong></p>"
                + "</div>";

        sendWithRetryAndFallback(bikerEmail, subject, body);
    }

    /**
     * Resilient internal helper executing email sends with Exponential Backoff Retry,
     * degrading gracefully by writing to the database DLQ if completely offline.
     */
    private void sendWithRetryAndFallback(String recipient, String subject, String bodyHtml) {
        int attempts = 0;
        Exception lastException = null;

        while (attempts < MAX_RETRIES) {
            try {
                attempts++;
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(recipient);
                helper.setFrom(fromEmail);
                helper.setSubject(subject);
                helper.setText(bodyHtml, true);

                mailSender.send(message);
                log.info("Successfully sent email notification to {} on attempt {}", recipient, attempts);
                return; // Sent successfully, return
            } catch (Exception e) {
                lastException = e;
                log.warn("Failed sending email to {} (attempt {}/{}): {}", recipient, attempts, MAX_RETRIES, e.getMessage());
                
                if (attempts < MAX_RETRIES) {
                    // Exponential backoff wait: 1s, 2s, etc.
                    long backoffTime = INITIAL_BACKOFF_MS * (long) Math.pow(2, attempts - 1);
                    try {
                        Thread.sleep(backoffTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Email backoff retry sleep interrupted: {}", ie.getMessage());
                        break;
                    }
                }
            }
        }

        // FALLBACK LOGIC: Save to Dead-Letter Queue in database
        log.error("CRITICAL: Failed to send email to {} after {} attempts. Routing to Dead-Letter Queue (DLQ).", recipient, MAX_RETRIES);
        try {
            FailedNotification dlqItem = new FailedNotification();
            dlqItem.setRecipient(recipient);
            dlqItem.setSubject(subject);
            dlqItem.setBody(bodyHtml);
            dlqItem.setErrorReason(lastException != null ? lastException.getClass().getSimpleName() + ": " + lastException.getMessage() : "Unknown");
            dlqItem.setRetryCount(MAX_RETRIES);
            failedNotificationRepository.save(dlqItem);
            log.info("Dead-Letter Queue: Successfully logged failed notification ID: {} for {}", dlqItem.getId(), recipient);
        } catch (Exception e) {
            log.error("Failed to write to Dead-Letter Queue database: {}", e.getMessage());
        }
    }
}
