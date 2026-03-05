package com.example.MotoShare.controller;

import com.example.MotoShare.dto.KycReviewDto;
import com.example.MotoShare.entity.Kyc;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.repository.KycRepository;
import com.example.MotoShare.service.KycVerificationService;
import com.example.MotoShare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/kyc")
@RequiredArgsConstructor
public class AdminKycController {

    private final UserService userService;
    private final KycVerificationService kycVerificationService;
    private final KycRepository kycRepository;

    // GET all pending KYC submissions for admin review
    @GetMapping("/pending")
    public ResponseEntity<List<KycReviewDto>> getPendingKyc() {

        List<Kyc> pendingList = kycRepository.findByStatus(KycStatus.PENDING);

        List<KycReviewDto> result = pendingList.stream().map(kyc -> new KycReviewDto(
                kyc.getUser().getUserId(),
                kyc.getUser().getName(),
                kyc.getUser().getEmail(),
                kyc.getUser().getPhoneNo(),
                kyc.getSelfieUrl(),
                kyc.getLicenceUrl(),
                kyc.getPanNo(),
                kyc.getAadhaarNo()
        )).toList();

        return ResponseEntity.ok(result);
    }

    // VERIFY KYC
    @PostMapping("/verify/{userId}")
    public ResponseEntity<?> verifyKyc(@PathVariable Long userId) {

        userService.updateKycStatus(userId, KycStatus.APPROVED);
        kycVerificationService.onKycVerified(userId);

        return ResponseEntity.ok("KYC VERIFIED successfully");
    }

    // REJECT KYC
    @PostMapping("/reject/{userId}")
    public ResponseEntity<?> rejectKyc(
            @PathVariable Long userId,
            @RequestParam(required = false) String reason
    ) {

        userService.updateKycStatus(userId, KycStatus.REJECTED);

        return ResponseEntity.ok(
                "KYC REJECTED" + (reason != null ? " : " + reason : "")
        );
    }
}

