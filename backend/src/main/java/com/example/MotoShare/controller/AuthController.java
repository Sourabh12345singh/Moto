package com.example.MotoShare.controller;

import com.example.MotoShare.dto.CreateUserRequestDto;
import com.example.MotoShare.dto.LoginRequestDto;
import com.example.MotoShare.dto.OtpResponseDto;
import com.example.MotoShare.service.AuthService;
import com.example.MotoShare.service.OtpService;
import com.example.MotoShare.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final OtpService otpService;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<OtpResponseDto> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean userExists = otpService.sendOtp(email);
        return ResponseEntity.ok(new OtpResponseDto("OTP sent successfully", userExists));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OtpResponseDto> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otpCode");
        boolean userExists = otpService.verifyOtp(email, otpCode);
        return ResponseEntity.ok(new OtpResponseDto("Email verified successfully", userExists));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        userService.resetPassword(email, password);
        return ResponseEntity.ok("Password updated successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody CreateUserRequestDto request) {
        userService.createUser(request);
        return ResponseEntity.ok("User created successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequestDto request) {
        String token = authService.authenticate(
                request.getEmail(),
                request.getPassword()
        );
        return ResponseEntity.ok(token);
    }
}
