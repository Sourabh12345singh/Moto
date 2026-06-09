package com.example.MotoShare.service;

import com.example.MotoShare.dto.AvailableBikeResponseDTO;
import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.mapper.AvailabilitySlotMapper;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final AvailabilitySlotMapper availabilitySlotMapper;

    /**
     * WHY @Transactional(readOnly = true)?
     * This is a pure read method. Without readOnly, Hibernate runs "dirty checking"
     * on every loaded entity — comparing every single field to detect changes.
     * For a search query loading 50+ slots, that's thousands of wasted comparisons.
     * readOnly=true skips all of this, giving a measurable performance boost.
     */
    @Transactional(readOnly = true)
    public List<AvailableBikeResponseDTO> getAvailableSlots(String city) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maxDate = now.plusDays(7);

        String normalizedCity = (city != null) ? city.trim().toLowerCase() : "";

        List<AvailabilitySlot> list = availabilitySlotRepository.findAvailableSlotsForNext7Days(
                normalizedCity, now, maxDate
        );

        return availabilitySlotMapper.toDtoList(list);
    }
}
