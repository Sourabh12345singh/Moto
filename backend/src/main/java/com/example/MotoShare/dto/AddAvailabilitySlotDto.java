package com.example.MotoShare.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AddAvailabilitySlotDto {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long pricePerHour;
    private String city;
    private String pickupLocation;
}
