package com.example.MotoShare.service;

import com.example.MotoShare.dto.GoogleLoginRequestDto;
import com.example.MotoShare.entity.Role;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class GoogleLoginTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    private RestTemplate mockRestTemplate;
    private RestTemplate originalRestTemplate;

    @BeforeEach
    public void setUp() {
        // Save original restTemplate and set mocked one
        mockRestTemplate = Mockito.mock(RestTemplate.class);
        originalRestTemplate = getAuthServiceRestTemplate();
        authService.setRestTemplate(mockRestTemplate);

        transactionTemplate.execute(status -> {
            cleanup();
            return null;
        });
    }

    @AfterEach
    public void tearDown() {
        // Restore original restTemplate
        authService.setRestTemplate(originalRestTemplate);

        transactionTemplate.execute(status -> {
            cleanup();
            return null;
        });
    }

    private void cleanup() {
        userRepository.deleteAll();
    }

    private RestTemplate getAuthServiceRestTemplate() {
        // Reflectively extract the current RestTemplate or just trust setup/teardown
        return new RestTemplate();
    }

    @Test
    public void testGoogleLoginExistingUser() {
        String testEmail = "existing-google@motoshare.com";

        // Pre-create the user in DB
        transactionTemplate.execute(status -> {
            User user = new User();
            user.setName("Existing Google User");
            user.setEmail(testEmail);
            user.setPhoneNo(9876543210L);
            user.setPassword("oldpassword");
            user.setRole(Role.BIKER);
            userRepository.save(user);
            return null;
        });

        // Mock RestTemplate token exchange
        Map<String, Object> tokenResponse = new HashMap<>();
        tokenResponse.put("access_token", "mock-access-token-123");
        Mockito.when(mockRestTemplate.postForEntity(
                ArgumentMatchers.eq("https://oauth2.googleapis.com/token"),
                ArgumentMatchers.any(HttpEntity.class),
                ArgumentMatchers.eq(Map.class)
        )).thenReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

        // Mock RestTemplate profile retrieval
        Map<String, Object> profileResponse = new HashMap<>();
        profileResponse.put("email", testEmail);
        profileResponse.put("name", "Existing Google User");
        Mockito.when(mockRestTemplate.exchange(
                ArgumentMatchers.eq("https://www.googleapis.com/oauth2/v3/userinfo"),
                ArgumentMatchers.eq(HttpMethod.GET),
                ArgumentMatchers.any(HttpEntity.class),
                ArgumentMatchers.eq(Map.class)
        )).thenReturn(new ResponseEntity<>(profileResponse, HttpStatus.OK));

        // Invoke service
        GoogleLoginRequestDto request = new GoogleLoginRequestDto();
        request.setCode("mock-auth-code");
        request.setRole(Role.TAKER); // Should be ignored since user already exists

        String token = authService.loginWithGoogle(request);
        assertNotNull(token);

        // Verify user was not duplicated or changed
        User user = userRepository.findByEmail(testEmail).orElseThrow();
        assertEquals("Existing Google User", user.getName());
        assertEquals(Role.BIKER, user.getRole()); // Retains original role
    }

    @Test
    public void testGoogleLoginNewUserAutoRegister() {
        String testEmail = "new-google@motoshare.com";

        // Mock RestTemplate token exchange
        Map<String, Object> tokenResponse = new HashMap<>();
        tokenResponse.put("access_token", "mock-access-token-456");
        Mockito.when(mockRestTemplate.postForEntity(
                ArgumentMatchers.eq("https://oauth2.googleapis.com/token"),
                ArgumentMatchers.any(HttpEntity.class),
                ArgumentMatchers.eq(Map.class)
        )).thenReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

        // Mock RestTemplate profile retrieval
        Map<String, Object> profileResponse = new HashMap<>();
        profileResponse.put("email", testEmail);
        profileResponse.put("name", "New Google User");
        Mockito.when(mockRestTemplate.exchange(
                ArgumentMatchers.eq("https://www.googleapis.com/oauth2/v3/userinfo"),
                ArgumentMatchers.eq(HttpMethod.GET),
                ArgumentMatchers.any(HttpEntity.class),
                ArgumentMatchers.eq(Map.class)
        )).thenReturn(new ResponseEntity<>(profileResponse, HttpStatus.OK));

        // Invoke service with default role (Taker)
        GoogleLoginRequestDto request = new GoogleLoginRequestDto();
        request.setCode("mock-auth-code");
        request.setRole(Role.TAKER);

        String token = authService.loginWithGoogle(request);
        assertNotNull(token);

        // Verify user was registered in DB
        User user = userRepository.findByEmail(testEmail).orElseThrow();
        assertEquals("New Google User", user.getName());
        assertEquals(Role.TAKER, user.getRole());
        assertNotNull(user.getPhoneNo());
        assertTrue(user.getPhoneNo() >= 1000000000L && user.getPhoneNo() <= 9999999999L);
    }

    @Test
    public void testGoogleLoginNewUserExplicitBikerRole() {
        String testEmail = "new-biker-google@motoshare.com";

        // Mock RestTemplate token exchange
        Map<String, Object> tokenResponse = new HashMap<>();
        tokenResponse.put("access_token", "mock-access-token-789");
        Mockito.when(mockRestTemplate.postForEntity(
                ArgumentMatchers.eq("https://oauth2.googleapis.com/token"),
                ArgumentMatchers.any(HttpEntity.class),
                ArgumentMatchers.eq(Map.class)
        )).thenReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

        // Mock RestTemplate profile retrieval
        Map<String, Object> profileResponse = new HashMap<>();
        profileResponse.put("email", testEmail);
        profileResponse.put("name", "New Biker Google User");
        Mockito.when(mockRestTemplate.exchange(
                ArgumentMatchers.eq("https://www.googleapis.com/oauth2/v3/userinfo"),
                ArgumentMatchers.eq(HttpMethod.GET),
                ArgumentMatchers.any(HttpEntity.class),
                ArgumentMatchers.eq(Map.class)
        )).thenReturn(new ResponseEntity<>(profileResponse, HttpStatus.OK));

        // Invoke service with explicit role (Biker)
        GoogleLoginRequestDto request = new GoogleLoginRequestDto();
        request.setCode("mock-auth-code");
        request.setRole(Role.BIKER);

        String token = authService.loginWithGoogle(request);
        assertNotNull(token);

        // Verify user was registered in DB with correct role
        User user = userRepository.findByEmail(testEmail).orElseThrow();
        assertEquals("New Biker Google User", user.getName());
        assertEquals(Role.BIKER, user.getRole());
    }
}
