package com.example.MotoShare.service;

import com.example.MotoShare.entity.*;
import com.example.MotoShare.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Enterprise-grade multi-threaded integration test verifying the Pessimistic Lock.
 * Simulates a "Flash Sale" scenario where 50 concurrent takers attempt to book
 * the exact same bike slot at the exact same millisecond.
 */
@SpringBootTest
@ActiveProfiles("test")
public class BookBikeConcurrencyTest {

    @Autowired
    private BookBikeService bookBikeService;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BikeRepository bikeRepository;

    @Autowired
    private BikerRepository bikerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    private UUID testSlotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<Long> takerUserIds = new ArrayList<>();
    private Long bikerUserId;

    @BeforeEach
    public void setUp() {
        transactionTemplate.execute(status -> {
            // Clean database state
            cleanupDatabase();

            // 1. Create a Biker User
            User bikerUser = new User();
            bikerUser.setName("Test Biker");
            bikerUser.setEmail("testbiker@motoshare.com");
            bikerUser.setPhoneNo(9999999990L);
            bikerUser.setPassword("password123");
            bikerUser.setRole(Role.BIKER);
            bikerUser.setKycStatus(KycStatus.APPROVED);
            userRepository.save(bikerUser);
            bikerUserId = bikerUser.getUserId();

            // 2. Map user to Biker entity
            Biker biker = new Biker();
            biker.setUser(bikerUser);
            bikerRepository.save(biker);

            // 3. Create a Bike owned by this Biker
            Bike bike = new Bike();
            bike.setBiker(biker);
            bike.setCompany("Royal Enfield");
            bike.setModel("Classic 350");
            bike.setRatePerHour(100L);
            bike.setBikeNumber("DL-1S-AA-1234");
            bike.setRcNumber("RC-998877");
            bike.setKms(1000L);
            bikeRepository.save(bike);

            // 4. Create 50 Taker Users (each will attempt a concurrent booking)
            for (int i = 1; i <= 50; i++) {
                User taker = new User();
                taker.setName("Test Taker " + i);
                taker.setEmail("taker" + i + "@motoshare.com");
                taker.setPhoneNo(9000000000L + i);
                taker.setPassword("password123");
                taker.setRole(Role.TAKER);
                taker.setKycStatus(KycStatus.APPROVED);
                userRepository.save(taker);
                takerUserIds.add(taker.getUserId());
            }

            // 5. Create an AvailabilitySlot (burst slot of 4 hours)
            startTime = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0).withNano(0);
            endTime = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);

            AvailabilitySlot slot = new AvailabilitySlot();
            slot.setBike(bike);
            slot.setStartHour(startTime);
            slot.setEndHour(endTime);
            slot.setPricePerHour(150L);
            slot.setIsAvailable(true);
            slot.setCity("Delhi");
            slot.setPickupLocation("Connaught Place Gate 2");
            availabilitySlotRepository.save(slot);
            testSlotId = slot.getId();
            return null;
        });
    }

    @AfterEach
    public void tearDown() {
        transactionTemplate.execute(status -> {
            cleanupDatabase();
            return null;
        });
    }

    private void cleanupDatabase() {
        bookingRepository.deleteAll();
        availabilitySlotRepository.deleteAll();
        bikeRepository.deleteAll();
        bikerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testConcurrentBookingsToSameSlotAllowedOnlyOnce() throws InterruptedException {
        int numberOfThreads = 50;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        
        // Latches to synchronize thread execution and force them to execute simultaneously
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final Long takerId = takerUserIds.get(i);
            executorService.submit(() -> {
                try {
                    // Block until the start latch is tripped
                    startLatch.await();
                    
                    // Attempt booking
                    bookBikeService.bookBike(testSlotId, startTime, endTime, takerId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    endLatch.countDown();
                }
            });
        }

        // All threads are queued and waiting. Trip the starting gate!
        startLatch.countDown();

        // Wait for all threads to finish execution (max 15 seconds)
        boolean finished = endLatch.await(15, TimeUnit.SECONDS);
        assertTrue(finished, "Not all threads finished within the timeout limit!");

        executorService.shutdown();

        // CONCURRENCY ASSERTIONS
        System.out.println("========== CONCURRENCY TEST RESULT ==========");
        System.out.println("Successful bookings: " + successCount.get());
        System.out.println("Failed bookings: " + failureCount.get());
        System.out.println("=============================================");

        // Exactly 1 thread must succeed
        assertEquals(1, successCount.get(), "Concurrency Failure: More than 1 taker booked the slot!");
        
        // 49 threads must fail due to Pessimistic row lock & availability checks
        assertEquals(49, failureCount.get(), "Concurrency Failure: Failed booking count mismatch!");

        // Assert that exactly 1 booking is saved in the database
        long bookingCount = bookingRepository.count();
        assertEquals(1, bookingCount, "Database contains duplicate bookings!");

        // Assert that the original slot is now marked as unavailable
        AvailabilitySlot updatedSlot = availabilitySlotRepository.findById(testSlotId).orElseThrow();
        assertFalse(updatedSlot.getIsAvailable(), "Availability slot was not updated to unavailable!");
    }
}
