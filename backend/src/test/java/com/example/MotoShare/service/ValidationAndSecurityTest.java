package com.example.MotoShare.service;

import com.example.MotoShare.dto.AddAvailabilitySlotDto;
import com.example.MotoShare.dto.SubmitKycDto;
import com.example.MotoShare.entity.*;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class ValidationAndSecurityTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private KycService kycService;

    @Autowired
    private KycVerificationService kycVerificationService;

    @Autowired
    private BikeAddinginSlotService bikeAddinginSlotService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BikerRepository bikerRepository;

    @Autowired
    private BikeRepository bikeRepository;

    @Autowired
    private KycRepository kycRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    private Long testUserId;
    private Long testBikeId;

    @BeforeEach
    public void setUp() {
        transactionTemplate.execute(status -> {
            // Clean any existing test state
            cleanup();

            // 1. Create Biker User
            User user = new User();
            user.setName("Test Validation User");
            user.setEmail("valuser@motoshare.com");
            user.setPhoneNo(9999888877L);
            user.setPassword("$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC"); // BCrypt for "Singh@123"
            user.setRole(Role.BIKER);
            user.setKycStatus(KycStatus.NOT_SUBMITTED);
            userRepository.save(user);
            testUserId = user.getUserId();

            // 2. Setup Biker record
            Biker biker = new Biker();
            biker.setUser(user);
            bikerRepository.save(biker);

            // 3. Setup Bike record
            Bike bike = new Bike();
            bike.setBiker(biker);
            bike.setCompany("Royal Enfield");
            bike.setModel("Himalayan");
            bike.setRatePerHour(120L);
            bike.setBikeNumber("DL-3S-BB-5678");
            bike.setRcNumber("RC-112233");
            bike.setKms(5000L);
            bikeRepository.save(bike);
            testBikeId = bike.getBikeId();
            
            return null;
        });
    }

    @AfterEach
    public void tearDown() {
        transactionTemplate.execute(status -> {
            cleanup();
            return null;
        });
    }

    private void cleanup() {
        // Drop rows starting from leaf nodes to root nodes to respect FK constraints
        availabilitySlotRepository.deleteAll();
        kycRepository.deleteAll();
        bikeRepository.deleteAll();
        bikerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testAuthServiceUserEnumerationProtection() {
        // Assert BadCredentialsException is thrown for non-existent users (prevents enumeration)
        BadCredentialsException ex1 = assertThrows(BadCredentialsException.class, () -> {
            authService.authenticate("nonexistent@motoshare.com", "Singh@123");
        });
        assertEquals("Invalid email or password", ex1.getMessage());

        // Assert same exception is thrown for invalid password on valid user
        BadCredentialsException ex2 = assertThrows(BadCredentialsException.class, () -> {
            authService.authenticate("valuser@motoshare.com", "WrongPassword");
        });
        assertEquals("Invalid email or password", ex2.getMessage());
    }

    @Test
    public void testKycDuplicateSubmissionBlocked() {
        // 1. First submission should succeed and mark status PENDING
        SubmitKycDto dto = new SubmitKycDto();
        dto.setSelfieUrl("http://img.com/selfie.jpg");
        dto.setLicenceUrl("http://img.com/lic.jpg");
        dto.setPanNo("ABCDE1234F");
        dto.setAadhaarNo("123456789012");
        kycService.submitKyc(testUserId, dto);

        User updatedUser = userRepository.findById(testUserId).orElseThrow();
        assertEquals(KycStatus.PENDING, updatedUser.getKycStatus());

        // 2. Second submission should be rejected with BusinessRuleException
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> {
            kycService.submitKyc(testUserId, dto);
        });
        assertTrue(ex.getMessage().contains("KYC already submitted"));
    }

    @Test
    public void testKycUnapprovedRoleVerificationBlocked() {
        // KYC is NOT_SUBMITTED initially, verify logic throws error if trying to complete verify
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> {
            kycVerificationService.onKycVerified(testUserId);
        });
        assertTrue(ex.getMessage().contains("KYC not verified yet"));
    }

    @Test
    public void testSlotDurationExceeding24HoursRejected() {
        // 1. Create a slot with 25 hours duration
        AddAvailabilitySlotDto dto = new AddAvailabilitySlotDto();
        LocalDateTime startTime = LocalDateTime.now().plusDays(1);
        LocalDateTime endTime = startTime.plusHours(25); // 25 hours

        dto.setStartTime(startTime);
        dto.setEndTime(endTime);
        dto.setCity("Jaipur");
        dto.setPickupLocation("Sindhi Camp Gate 1");

        // 2. Assert slot creation is rejected
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> {
            bikeAddinginSlotService.addSlot(testBikeId, dto);
        });
        assertEquals("Availability slot duration cannot exceed 24 hours", ex.getMessage());
    }

    @Test
    public void testSlotDurationWithin24HoursSucceeds() {
        // 1. Create slot with 23 hours duration
        AddAvailabilitySlotDto dto = new AddAvailabilitySlotDto();
        LocalDateTime startTime = LocalDateTime.now().plusDays(1);
        LocalDateTime endTime = startTime.plusHours(23); // 23 hours

        dto.setStartTime(startTime);
        dto.setEndTime(endTime);
        dto.setCity("Jaipur");
        dto.setPickupLocation("Sindhi Camp Gate 1");

        // 2. Assert no exception is thrown
        assertDoesNotThrow(() -> {
            bikeAddinginSlotService.addSlot(testBikeId, dto);
        });
    }
}
