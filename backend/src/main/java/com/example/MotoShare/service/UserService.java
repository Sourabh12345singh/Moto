package com.example.MotoShare.service;

import com.example.MotoShare.dto.CreateUserRequestDto;
import com.example.MotoShare.entity.Kyc;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.entity.User;
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

    public User createUser(CreateUserRequestDto dto) {

        if (userRepository.existsByPhoneNo(dto.getPhoneNo())) {
            throw new RuntimeException("Phone number already exists");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // Encrypt the password
        user.setPhoneNo(dto.getPhoneNo());
        user.setRole(dto.getRole());
        user.setKycStatus(KycStatus.NOT_SUBMITTED);

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void updateKycStatus(Long userId, KycStatus status) {

        // debugging line
        System.out.println(   "i reached here 010" );

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // debugging line
        System.out.println(   "i reached here" );

        if (status == KycStatus.REJECTED) {
            kycRepository.deleteByUserId(userId);
            user.setKycStatus(KycStatus.REJECTED);
            userRepository.save(user);
            return;
        }

        user.setKycStatus(status);
        userRepository.save(user);
    }
}


