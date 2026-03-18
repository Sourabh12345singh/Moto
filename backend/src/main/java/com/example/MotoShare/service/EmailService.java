package com.example.MotoShare.service;

import jakarta.mail.MessagingException;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Async
    public void sendBookingConfirmationToTaker(
            String takerEmail, String takerName,
            String bikeName, String city, String pickupLocation,
            LocalDateTime startTime, LocalDateTime endTime, long totalPrice
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(takerEmail);
            helper.setFrom(fromEmail);
            helper.setSubject("MotoShare - Booking Confirmed!");
            helper.setText(
                    "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>"
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
                    + "</div>",
                    true
            );

            mailSender.send(message);
            log.info("Booking confirmation email sent to taker: {}", takerEmail);
        } catch (MessagingException e) {
            log.error("Failed to send booking confirmation email to taker: {}", takerEmail, e);
        }
    }

    @Async
    public void sendBookingNotificationToBiker(
            String bikerEmail, String bikerName,
            String bikeName, String takerName, String takerEmail,
            String city, String pickupLocation,
            LocalDateTime startTime, LocalDateTime endTime, long totalPrice
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(bikerEmail);
            helper.setFrom(fromEmail);
            helper.setSubject("MotoShare - New Booking for Your Bike!");
            helper.setText(
                    "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>"
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
                    + "</div>",
                    true
            );

            mailSender.send(message);
            log.info("Booking notification email sent to biker: {}", bikerEmail);
        } catch (MessagingException e) {
            log.error("Failed to send booking notification email to biker: {}", bikerEmail, e);
        }
    }
}
