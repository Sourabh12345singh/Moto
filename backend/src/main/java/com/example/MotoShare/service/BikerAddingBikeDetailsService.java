package com.example.MotoShare.service;

import com.example.MotoShare.dto.AddBikeRequestDto;
import com.example.MotoShare.dto.BikerBikeResponseDto;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.entity.Biker;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.entity.Role;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.error.ResourceNotFoundException;
import com.example.MotoShare.repository.BikeRepository;
import com.example.MotoShare.repository.BikerRepository;
import com.example.MotoShare.repository.UserRepository;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class BikerAddingBikeDetailsService {

    private final BikeRepository bikeRepository;
    private final BikerRepository bikerRepository;
    private final UserRepository userRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    @Transactional
    public Bike addBikeDetails(AddBikeRequestDto dto , Long bikerId) {

        // Normalize the number plate
        String normalizedPlate =
                dto.getBikeNumber().toUpperCase().replaceAll("\\s+", "");

        if (bikeRepository.existsByBikeNumber(normalizedPlate)) {
            throw new BusinessRuleException("Bike with this number plate already exists");
        }

        // Try to find existing Biker entity
        Biker biker = bikerRepository.findById(bikerId).orElse(null);

        // If Biker entity doesn't exist, create it for approved BIKER users
        if (biker == null) {
            log.warn("Biker entity not found for userId: {}. Attempting to create...", bikerId);
            
            User user = userRepository.findById(bikerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", bikerId));
            
            // Validate user is a BIKER with approved KYC
            if (user.getRole() != Role.BIKER) {
                throw new BusinessRuleException("User is not a BIKER. Role: " + user.getRole());
            }
            if (user.getKycStatus() != KycStatus.APPROVED) {
                throw new BusinessRuleException("Complete KYC verification before adding bikes. Status: " + user.getKycStatus());
            }
            
            // Create Biker entity (this was missed during KYC approval)
            biker = new Biker();
            biker.setUser(user);
            biker = bikerRepository.save(biker);
            log.info("Created missing Biker entity for userId: {}", bikerId);
        }

        // Validate RC number
        if (dto.getRcNumber() == null || dto.getRcNumber().trim().isEmpty()) {
            throw new BusinessRuleException("RC Number cannot be null or empty");
        }

        Bike bike = Bike.builder()
                .biker(biker)
                .company(dto.getCompany())
                .model(dto.getModel())
                .ratePerHour(dto.getRatePerHour())
                .bikeNumber(normalizedPlate)
                .rcNumber(dto.getRcNumber())
                .kms(dto.getKms())
                .imageUrl(dto.getImageUrl())
                .build();

        return bikeRepository.save(bike);
    }

    /**
     * WHY @org.springframework.transaction.annotation.Transactional(readOnly = true)?
     *
     * Disables Hibernate's session dirty-checking mechanism for performance optimization.
     * Tells the transaction manager this is a read-only request, which can route query
     * execution to read-only replica databases in scale setups.
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<BikerBikeResponseDto> getBikesByBiker(Long bikerId) {
        List<Bike> bikes = bikeRepository.findByBikerUserId(bikerId);
        return bikes.stream()
                .map(bike -> {
                    List<AvailabilitySlot> slots = availabilitySlotRepository.findByBikeBikeId(bike.getBikeId());
                    List<BikerBikeResponseDto.BikerSlotDto> slotDtos = slots.stream()
                            .map(slot -> BikerBikeResponseDto.BikerSlotDto.builder()
                                    .slotId(slot.getId())
                                    .startTime(slot.getStartHour())
                                    .endTime(slot.getEndHour())
                                    .isAvailable(slot.getIsAvailable())
                                    .city(slot.getCity())
                                    .pickupLocation(slot.getPickupLocation())
                                    .build())
                            .collect(Collectors.toList());

                    return BikerBikeResponseDto.builder()
                            .bikeId(bike.getBikeId())
                            .company(bike.getCompany())
                            .model(bike.getModel())
                            .bikeNumber(bike.getBikeNumber())
                            .rcNumber(bike.getRcNumber())
                            .kms(bike.getKms())
                            .ratePerHour(bike.getRatePerHour())
                            .imageUrl(bike.getImageUrl())
                            .slots(slotDtos)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
