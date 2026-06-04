package com.example.MotoShare.service;

import com.example.MotoShare.entity.User;
import com.example.MotoShare.repository.UserRepository;
import com.example.MotoShare.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Authenticate user login credentials.
     *
     * WHY throw BadCredentialsException for both user not found and password mismatch?
     * This is a fundamental security requirement (prevention of User Enumeration).
     * If the API responds with "User not found" for a missing email but "Invalid credentials"
     * for a wrong password, an attacker can programmatically scan emails to find which ones
     * are registered on the platform. Throwing a generic "Invalid email or password" prevents this.
     */
    public String authenticate(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return jwtUtil.generateToken(user);
    }
}
