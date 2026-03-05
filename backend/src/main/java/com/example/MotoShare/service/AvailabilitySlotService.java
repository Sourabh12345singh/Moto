package com.example.MotoShare.service;

import com.example.MotoShare.dto.AvailableBikeResponseDTO;
import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.mapper.AvailabilitySlotMapper;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;

@Service
//@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final AvailabilitySlotMapper availabilitySlotMapper;

//    public AvailabilitySlotService(AvailabilitySlotRepository availabilitySlotRepository) {
//        this.availabilitySlotRepository = availabilitySlotRepository;
//    }


    // Method to get available slots
    public List<AvailableBikeResponseDTO> getAvailableSlots(String city) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maxDate = now.plusDays(7);

        // Call via injected repository instance
        List<AvailabilitySlot> list =  availabilitySlotRepository.findAvailableSlotsForNext7Days(
                city, now, maxDate
        );

        return availabilitySlotMapper.toDtoList(list);


    }
}
