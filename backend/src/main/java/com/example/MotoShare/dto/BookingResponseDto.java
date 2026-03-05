package com.example.MotoShare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookingResponseDto {

    private Long id;
    private String bikeCompany;
    private String bikeModel;
    private String city;
    private String pickupLocation;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long totalPrice;
    private Long pricePerHour;
    private Long durationHours;
    private String status; // "UPCOMING" or "COMPLETED"
}
