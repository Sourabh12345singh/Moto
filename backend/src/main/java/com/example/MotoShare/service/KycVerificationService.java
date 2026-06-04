package com.example.MotoShare.service;

import com.example.MotoShare.entity.*;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.error.ResourceNotFoundException;
import com.example.MotoShare.repository.BikerRepository;
import com.example.MotoShare.repository.TakerRepository;
import com.example.MotoShare.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycVerificationService {

    private final UserRepository userRepository;
    private final BikerRepository bikerRepository;
    private final TakerRepository takerRepository;

    @Transactional
    public void onKycVerified(Long userId) {
        log.info("Processing KYC verification for userId: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getKycStatus() == KycStatus.REJECTED) {
            log.warn("KYC is rejected for userId: {}, cannot create role entity", userId);
            throw new BusinessRuleException("KYC is rejected, cannot create role profile");
        }
        
        if (user.getKycStatus() != KycStatus.APPROVED) {
            log.warn("KYC not approved for userId: {}, status: {}", userId, user.getKycStatus());
            throw new BusinessRuleException("KYC not verified yet. Current status: " + user.getKycStatus());
        }

        if (user.getRole() == Role.BIKER) {
            if (!bikerRepository.existsById(userId)) {
                Biker biker = new Biker();
                biker.setUser(user);
                bikerRepository.save(biker);
                log.info("Created Biker entity for userId: {}", userId);
            } else {
                log.info("Biker entity already exists for userId: {}", userId);
            }
        }

        if (user.getRole() == Role.TAKER) {
            if (!takerRepository.existsById(userId)) {
                Taker taker = new Taker();
                taker.setUser(user);
                takerRepository.save(taker);
                log.info("Created Taker entity for userId: {}", userId);
            } else {
                log.info("Taker entity already exists for userId: {}", userId);
            }
        }
    }
}
