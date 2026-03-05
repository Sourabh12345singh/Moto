package com.example.MotoShare.service;

import com.example.MotoShare.entity.*;
import com.example.MotoShare.repository.BikerRepository;
import com.example.MotoShare.repository.TakerRepository;
import com.example.MotoShare.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KycVerificationService {

    private final UserRepository userRepository;
    private final BikerRepository bikerRepository;
    private final TakerRepository takerRepository;

    @Transactional
    public void onKycVerified(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getKycStatus() != KycStatus.APPROVED) {
            throw new RuntimeException("KYC not verified");
        }
        else if(user.getKycStatus() == KycStatus.REJECTED){
            throw new RuntimeException("KYC is rejected, cannot create role entity");
        }

        if (user.getRole() == Role.BIKER) {
            if (!bikerRepository.existsById(userId)) {
                Biker biker = new Biker();
                biker.setUser(user);
                bikerRepository.save(biker);
            }
        }

        if (user.getRole() == Role.TAKER) {
            if (!takerRepository.existsById(userId)) {
                Taker taker = new Taker();
                taker.setUser(user);
                takerRepository.save(taker);
            }
        }
    }
}

