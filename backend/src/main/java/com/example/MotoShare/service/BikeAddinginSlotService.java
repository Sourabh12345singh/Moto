package com.example.MotoShare.service;

import com.example.MotoShare.dto.AddAvailabilitySlotDto;
import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import com.example.MotoShare.repository.BikeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BikeAddinginSlotService {

    private final BikeRepository bikeRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    @Transactional
    public void addSlot(Long bikeId, AddAvailabilitySlotDto dto) {

        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() ->
                        new RuntimeException("Bike not found with id: " + bikeId));

        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setBike(bike);
        slot.setStartHour(dto.getStartTime());
        slot.setEndHour(dto.getEndTime());
        slot.setPricePerHour(bike.getRatePerHour());
        slot.setIsAvailable(true);
        slot.setCity(dto.getCity());
        slot.setPickupLocation(dto.getPickupLocation());

        availabilitySlotRepository.save(slot);
    }
}
