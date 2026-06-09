package com.example.MotoShare.service;

import com.example.MotoShare.entity.Otp;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.repository.OtpRepository;
import com.example.MotoShare.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generates and sends a 6-digit OTP to the email.
     * Returns true if the user already exists, false if new.
     */
    @Transactional
    public boolean sendOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new BusinessRuleException("Email cannot be blank");
        }
        
        email = email.trim().toLowerCase();
        
        // Generate a 6-digit random code
        String otpCode = String.format("%06d", random.nextInt(1000000));
        
        // Find existing OTP or create new one
        Otp otp = otpRepository.findByEmail(email).orElse(new Otp());
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setVerified(false);
        otp.setVerifiedAt(null);
        
        otpRepository.save(otp);
        
        // Send email asynchronously
        emailService.sendOtpEmail(email, otpCode);
        log.info("OTP generated and sent to email: {}", email);
        
        return userRepository.existsByEmail(email);
    }

    /**
     * Verifies the OTP code.
     * Returns true if user exists, false if new.
     */
    @Transactional
    public boolean verifyOtp(String email, String otpCode) {
        if (email == null || otpCode == null) {
            throw new BusinessRuleException("Email and OTP code are required");
        }
        
        email = email.trim().toLowerCase();
        otpCode = otpCode.trim();
        
        Otp otp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("No OTP requested for this email"));
                
        if (!otp.getOtpCode().equals(otpCode)) {
            throw new BusinessRuleException("Invalid OTP code");
        }
        
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("OTP has expired");
        }
        
        otp.setVerified(true);
        otp.setVerifiedAt(LocalDateTime.now());
        otpRepository.save(otp);
        
        log.info("OTP verified successfully for email: {}", email);
        return userRepository.existsByEmail(email);
    }

    /**
     * Check if email has been verified recently (within 15 minutes).
     */
    public boolean isOtpVerified(String email) {
        if (email == null) return false;
        email = email.trim().toLowerCase();
        
        Otp otp = otpRepository.findByEmail(email).orElse(null);
        if (otp == null || !otp.isVerified() || otp.getVerifiedAt() == null) {
            return false;
        }
        
        // Check if verified within last 15 minutes
        return otp.getVerifiedAt().isAfter(LocalDateTime.now().minusMinutes(15));
    }

    /**
     * Consume (delete) the OTP after registration/reset is complete.
     */
    @Transactional
    public void consumeOtp(String email) {
        if (email != null) {
            email = email.trim().toLowerCase();
            otpRepository.deleteByEmail(email);
            log.info("OTP consumed (deleted) for email: {}", email);
        }
    }
}
