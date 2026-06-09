package com.example.MotoShare.service;

import com.example.MotoShare.dto.GoogleLoginRequestDto;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.entity.Role;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.repository.UserRepository;
import com.example.MotoShare.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    private RestTemplate restTemplate = new RestTemplate();

    public void setRestTemplate(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

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

    /**
     * Authenticate or register a user using Google OAuth 2.0.
     */
    public String loginWithGoogle(GoogleLoginRequestDto request) {
        String code = request.getCode();
        String redirectUri = (request.getRedirectUri() != null && !request.getRedirectUri().isBlank())
                ? request.getRedirectUri()
                : "postmessage";

        // 1. Exchange auth code for access token

        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> tokenBody = new LinkedMultiValueMap<>();
        tokenBody.add("code", code);
        tokenBody.add("client_id", googleClientId);
        tokenBody.add("client_secret", googleClientSecret);
        tokenBody.add("redirect_uri", redirectUri);
        tokenBody.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(tokenBody, tokenHeaders);

        String tokenUrl = "https://oauth2.googleapis.com/token";
        ResponseEntity<Map> tokenResponse;
        try {
            tokenResponse = restTemplate.postForEntity(tokenUrl, tokenRequest, Map.class);
        } catch (Exception e) {
            throw new BadCredentialsException("Failed to exchange Google authorization code: " + e.getMessage());
        }

        if (tokenResponse.getStatusCode() != HttpStatus.OK || tokenResponse.getBody() == null) {
            throw new BadCredentialsException("Invalid token response from Google");
        }

        Map<String, Object> responseBody = tokenResponse.getBody();
        String accessToken = (String) responseBody.get("access_token");
        if (accessToken == null) {
            throw new BadCredentialsException("No access token returned from Google");
        }

        // 2. Fetch user profile info from Google
        HttpHeaders profileHeaders = new HttpHeaders();
        profileHeaders.setBearerAuth(accessToken);
        HttpEntity<Void> profileRequest = new HttpEntity<>(profileHeaders);

        String profileUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
        ResponseEntity<Map> profileResponse;
        try {
            profileResponse = restTemplate.exchange(profileUrl, HttpMethod.GET, profileRequest, Map.class);
        } catch (Exception e) {
            throw new BadCredentialsException("Failed to fetch Google user profile: " + e.getMessage());
        }

        if (profileResponse.getStatusCode() != HttpStatus.OK || profileResponse.getBody() == null) {
            throw new BadCredentialsException("Invalid profile response from Google");
        }

        Map<String, Object> profile = profileResponse.getBody();
        String email = (String) profile.get("email");
        String name = (String) profile.get("name");

        if (email == null || email.isBlank()) {
            throw new BadCredentialsException("Email not provided by Google account");
        }

        String finalEmail = email.trim().toLowerCase();

        // 3. Find or auto-register the user
        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            // Register new user dynamically
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setName(name != null ? name : finalEmail.split("@")[0]);
            newUser.setPhoneNo(generateUniquePhoneNo());
            newUser.setPassword(generateSecurePassword());

            // Set role: use selected role from request if provided, otherwise default to TAKER
            Role role = request.getRole() != null ? request.getRole() : Role.TAKER;
            newUser.setRole(role);
            newUser.setKycStatus(KycStatus.NOT_SUBMITTED);

            return userRepository.save(newUser);
        });

        // 4. Generate and return JWT token
        return jwtUtil.generateToken(user);
    }

    private Long generateUniquePhoneNo() {
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 100; i++) {
            // Generate a 10-digit number between 1000000000 and 9999999999
            long phoneNo = 1000000000L + (long)(random.nextDouble() * 9000000000L);
            if (!userRepository.existsByPhoneNo(phoneNo)) {
                return phoneNo;
            }
        }
        throw new BusinessRuleException("Failed to generate a unique phone number placeholder");
    }

    private String generateSecurePassword() {
        return passwordEncoder.encode(java.util.UUID.randomUUID().toString());
    }
}

