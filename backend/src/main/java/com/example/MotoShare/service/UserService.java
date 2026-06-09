package com.example.MotoShare.service;

import com.example.MotoShare.dto.CreateUserRequestDto;
import com.example.MotoShare.entity.Kyc;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.error.ResourceNotFoundException;
import com.example.MotoShare.repository.KycRepository;
import com.example.MotoShare.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final KycRepository kycRepository;
    private final OtpService otpService;

    public User createUser(CreateUserRequestDto dto) {
        String email = dto.getEmail().trim().toLowerCase();

        if (!otpService.isOtpVerified(email)) {
            throw new BusinessRuleException("Email has not been verified. Please verify email first.");
        }

        if (userRepository.existsByPhoneNo(dto.getPhoneNo())) {
            throw new BusinessRuleException("Phone number already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleException("User already exists");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // Encrypt the password
        user.setPhoneNo(dto.getPhoneNo());
        user.setRole(dto.getRole());
        user.setKycStatus(KycStatus.NOT_SUBMITTED);

        User savedUser = userRepository.save(user);
        otpService.consumeOtp(email); // Consume OTP after successful registration
        return savedUser;
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        if (email == null || newPassword == null || newPassword.trim().length() < 6) {
            throw new BusinessRuleException("Email and valid password (min 6 characters) are required");
        }

        final String finalEmail = email.trim().toLowerCase();

        if (!otpService.isOtpVerified(finalEmail)) {
            throw new BusinessRuleException("Email has not been verified. Please verify email first.");
        }

        User user = userRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", finalEmail));

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        otpService.consumeOtp(finalEmail); // Consume OTP after successful password reset
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
    }

    @Transactional
    public void updateKycStatus(Long userId, KycStatus status) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (status == KycStatus.REJECTED) {
            kycRepository.deleteByUserId(userId);
            user.setKycStatus(KycStatus.REJECTED);
            userRepository.save(user);
            return;
        }

        // Update user's kycStatus
        user.setKycStatus(status);
        userRepository.save(user);

        // Also update the Kyc entity's status so it no longer shows as PENDING
        Kyc kyc = kycRepository.findByUserId(userId).orElse(null);
        if (kyc != null) {
            kyc.setStatus(status);
            kycRepository.save(kyc);
        }
    }
}
