package com.example.MotoShare.service;

import com.example.MotoShare.dto.AvailableBikeResponseDTO;
import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.mapper.AvailabilitySlotMapper;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final AvailabilitySlotMapper availabilitySlotMapper;

    public List<AvailableBikeResponseDTO> getAvailableSlots(String city) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maxDate = now.plusDays(7);

        List<AvailabilitySlot> list = availabilitySlotRepository.findAvailableSlotsForNext7Days(
                city, now, maxDate
        );

        return availabilitySlotMapper.toDtoList(list);
    }
}
