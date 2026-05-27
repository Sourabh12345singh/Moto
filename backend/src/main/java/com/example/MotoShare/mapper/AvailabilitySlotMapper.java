package com.example.MotoShare.mapper;

import com.example.MotoShare.dto.AvailableBikeResponseDTO;
import com.example.MotoShare.entity.AvailabilitySlot;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AvailabilitySlotMapper {

    public static AvailableBikeResponseDTO toDto(AvailabilitySlot slot) {
        return AvailableBikeResponseDTO.builder()
                .slotId(slot.getId())
                .bikeId(slot.getBike().getBikeId())
                .company(slot.getBike().getCompany())
                .model(slot.getBike().getModel())
                .pricePerHour(slot.getPricePerHour())
                .startHour(slot.getStartHour())
                .endHour(slot.getEndHour())
                .city(slot.getCity())
                .pickupLocation(slot.getPickupLocation())
                .imageUrl(slot.getBike().getImageUrl())
                .build();
    }

    public static List<AvailableBikeResponseDTO> toDtoList(
            List<AvailabilitySlot> slots) {

        return slots.stream()
                .map(AvailabilitySlotMapper::toDto)
                .collect(Collectors.toList());
    }
}
