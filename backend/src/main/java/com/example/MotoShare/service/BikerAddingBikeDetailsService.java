package com.example.MotoShare.service;


import com.example.MotoShare.dto.AddBikeRequestDto;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.entity.Biker;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.entity.Role;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.repository.BikeRepository;
import com.example.MotoShare.repository.BikerRepository;
import com.example.MotoShare.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class BikerAddingBikeDetailsService {

    private final BikeRepository bikeRepository;
    private final BikerRepository bikerRepository;
    private final UserRepository userRepository;

    @Transactional
    public Bike addBikeDetails(AddBikeRequestDto dto , Long bikerId) {

        // Normalize the number plate
        String normalizedPlate =
                dto.getBikeNumber().toUpperCase().replaceAll("\\s+", "");

        if (bikeRepository.existsByBikeNumber(normalizedPlate)) {
            throw new RuntimeException("Bike with this number plate already exists");
        }

        // Try to find existing Biker entity
        Biker biker = bikerRepository.findById(bikerId).orElse(null);

        // If Biker entity doesn't exist, create it for approved BIKER users
        if (biker == null) {
            log.warn("Biker entity not found for userId: {}. Attempting to create...", bikerId);
            
            User user = userRepository.findById(bikerId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate user is a BIKER with approved KYC
            if (user.getRole() != Role.BIKER) {
                throw new RuntimeException("User is not a BIKER");
            }
            if (user.getKycStatus() != KycStatus.APPROVED) {
                throw new RuntimeException("Complete KYC verification before adding bikes");
            }
            
            // Create Biker entity (this was missed during KYC approval)
            biker = new Biker();
            biker.setUser(user);
            biker = bikerRepository.save(biker);
            log.info("Created missing Biker entity for userId: {}", bikerId);
        }

        // Validate RC number
        if (dto.getRcNumber() == null || dto.getRcNumber().trim().isEmpty()) {
            throw new RuntimeException("RC Number cannot be null or empty");
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
}
