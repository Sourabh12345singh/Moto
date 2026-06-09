package com.example.MotoShare.service;

import com.example.MotoShare.dto.CreateUserRequestDto;
import com.example.MotoShare.entity.Otp;
import com.example.MotoShare.entity.Role;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.repository.OtpRepository;
import com.example.MotoShare.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class OtpVerificationTest {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserService userService;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @BeforeEach
    public void setUp() {
        transactionTemplate.execute(status -> {
            cleanup();
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
        otpRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testSendOtpFlow() {
        String testEmail = "testotp@motoshare.com";
        
        // 1. Send OTP
        boolean exists = otpService.sendOtp(testEmail);
        assertFalse(exists); // user should not exist initially
        
        // 2. Verify record is created in DB
        Otp otp = otpRepository.findByEmail(testEmail).orElse(null);
        assertNotNull(otp);
        assertEquals(6, otp.getOtpCode().length());
        assertFalse(otp.isVerified());
        assertTrue(otp.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    public void testVerifyOtpIncorrectCodeFails() {
        String testEmail = "testverify@motoshare.com";
        otpService.sendOtp(testEmail);
        
        // 1. Verify fails for wrong code
        assertThrows(BusinessRuleException.class, () -> {
            otpService.verifyOtp(testEmail, "999999");
        });
        
        // 2. OTP status remains unverified
        assertFalse(otpService.isOtpVerified(testEmail));
    }

    @Test
    public void testVerifyOtpSuccess() {
        String testEmail = "testsuccess@motoshare.com";
        otpService.sendOtp(testEmail);
        
        Otp otp = otpRepository.findByEmail(testEmail).orElseThrow();
        String code = otp.getOtpCode();
        
        // 1. Verify succeeds with correct code
        boolean exists = otpService.verifyOtp(testEmail, code);
        assertFalse(exists);
        
        // 2. OTP is verified
        assertTrue(otpService.isOtpVerified(testEmail));
    }

    @Test
    public void testVerifyExpiredOtpFails() {
        String testEmail = "testexpired@motoshare.com";
        otpService.sendOtp(testEmail);
        
        // Manually set expiration in past
        Otp otp = otpRepository.findByEmail(testEmail).orElseThrow();
        otp.setExpiresAt(LocalDateTime.now().minusSeconds(1));
        otpRepository.save(otp);
        
        String code = otp.getOtpCode();
        
        // 1. Verify fails for expired OTP
        assertThrows(BusinessRuleException.class, () -> {
            otpService.verifyOtp(testEmail, code);
        });
    }

    @Test
    public void testRegisterRequiresVerifiedOtp() {
        String testEmail = "testreg@motoshare.com";
        
        CreateUserRequestDto dto = new CreateUserRequestDto();
        dto.setName("OTP Test User");
        dto.setEmail(testEmail);
        dto.setPhoneNo(1234567890L);
        dto.setPassword("password123");
        dto.setRole(Role.TAKER);
        
        // 1. Attempt to register without OTP verification fails
        assertThrows(BusinessRuleException.class, () -> {
            userService.createUser(dto);
        });
        
        // 2. Send and verify OTP
        otpService.sendOtp(testEmail);
        Otp otp = otpRepository.findByEmail(testEmail).orElseThrow();
        otpService.verifyOtp(testEmail, otp.getOtpCode());
        
        // 3. Register now succeeds
        User user = assertDoesNotThrow(() -> {
            return userService.createUser(dto);
        });
        assertNotNull(user);
        
        // 4. Verify OTP was consumed/deleted after registration
        assertFalse(otpRepository.findByEmail(testEmail).isPresent());
    }

    @Test
    public void testResetPasswordFlow() {
        String testEmail = "testreset@motoshare.com";
        
        // Pre-create User
        transactionTemplate.execute(status -> {
            User user = new User();
            user.setName("Reset Test User");
            user.setEmail(testEmail);
            user.setPhoneNo(9876543210L);
            user.setPassword("oldpassword");
            user.setRole(Role.TAKER);
            userRepository.save(user);
            return null;
        });
        
        // 1. Send OTP (returns exists = true)
        boolean exists = otpService.sendOtp(testEmail);
        assertTrue(exists);
        
        Otp otp = otpRepository.findByEmail(testEmail).orElseThrow();
        
        // 2. Verify OTP
        otpService.verifyOtp(testEmail, otp.getOtpCode());
        
        // 3. Reset password succeeds
        assertDoesNotThrow(() -> {
            userService.resetPassword(testEmail, "newpassword123");
        });
        
        // 4. OTP is consumed
        assertFalse(otpRepository.findByEmail(testEmail).isPresent());
    }
}
