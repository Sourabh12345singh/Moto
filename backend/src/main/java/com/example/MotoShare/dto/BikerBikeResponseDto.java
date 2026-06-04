package com.example.MotoShare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BikerBikeResponseDto {
    private Long bikeId;
    private String company;
    private String model;
    private String bikeNumber;
    private String rcNumber;
    private Long kms;
    private Long ratePerHour;
    private String imageUrl;
    private List<BikerSlotDto> slots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BikerSlotDto {
        private UUID slotId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private boolean isAvailable;
        private String city;
        private String pickupLocation;
    }
}
