package com.example.MotoShare.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AvailableBikeResponseDTO {
    private Long bikeId;
    private String company;
    private String model;
    private String city;
    private String pickupLocation;

    private UUID slotId;
    private LocalDateTime startHour;
    private LocalDateTime endHour;
    private Long pricePerHour;
    private String imageUrl;
}

