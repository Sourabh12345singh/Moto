package com.example.MotoShare.controller;

import com.example.MotoShare.dto.SubmitKycDto;
import com.example.MotoShare.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PostMapping("/{userId}")
    public ResponseEntity<String> submitKyc(
            @PathVariable Long userId,
            @RequestBody SubmitKycDto dto
    ) {
        kycService.submitKyc(userId, dto);
        return ResponseEntity.ok("KYC submitted successfully");
    }
}
