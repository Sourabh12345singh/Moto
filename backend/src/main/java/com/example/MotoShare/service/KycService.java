package com.example.MotoShare.service;

import com.example.MotoShare.dto.SubmitKycDto;
import com.example.MotoShare.entity.Kyc;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.repository.KycRepository;
import com.example.MotoShare.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KycService {

    private final UserRepository userRepository;
    private final KycRepository kycRepository;

    @Transactional // both operations should succeed or fail together
    public void submitKyc(Long userId, SubmitKycDto dto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent duplicate KYC
        if (user.getKycStatus() != KycStatus.NOT_SUBMITTED) {
            throw new RuntimeException("KYC already submitted");
        }

        // 1️⃣ Save KYC
        Kyc kyc = new Kyc();
        kyc.setUser(user);
        kyc.setSelfieUrl(dto.getSelfieUrl());
        kyc.setLicenceUrl(dto.getLicenceUrl());
        kyc.setPanNo(dto.getPanNo());
        kyc.setAadhaarNo(dto.getAadhaarNo());
        kyc.setStatus(KycStatus.PENDING);

        kycRepository.save(kyc);

        // 2️⃣ Update USER table
        user.setKycStatus(KycStatus.PENDING);
        userRepository.save(user);


    }


}

