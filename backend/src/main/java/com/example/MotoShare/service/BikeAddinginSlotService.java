package com.example.MotoShare.service;

import com.example.MotoShare.dto.AddAvailabilitySlotDto;
import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.error.ResourceNotFoundException;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import com.example.MotoShare.repository.BikeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class BikeAddinginSlotService {

    private final BikeRepository bikeRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    @Transactional
    public void addSlot(Long bikeId, AddAvailabilitySlotDto dto) {

        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Bike", bikeId));

        // Enforce maximum slot duration limit: 24 hours
        /*
         * WHY enforce 24 hours max?
         * Prevents owners from listing massive, multi-day blocks which makes slot
         * splitting under high booking concurrency inefficient and complex.
         * For longer availabilities, owners should register separate daily slots.
         */
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new BusinessRuleException("Start time and End time are required");
        }
        
        long hours = Duration.between(dto.getStartTime(), dto.getEndTime()).toHours();
        if (hours > 24) {
            throw new BusinessRuleException("Availability slot duration cannot exceed 24 hours");
        }

        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setBike(bike);
        slot.setStartHour(dto.getStartTime());
        slot.setEndHour(dto.getEndTime());
        slot.setPricePerHour(bike.getRatePerHour());
        slot.setIsAvailable(true);
        slot.setCity(dto.getCity() != null ? dto.getCity().trim().toLowerCase() : "");
        slot.setPickupLocation(dto.getPickupLocation());

        availabilitySlotRepository.save(slot);
    }
}

