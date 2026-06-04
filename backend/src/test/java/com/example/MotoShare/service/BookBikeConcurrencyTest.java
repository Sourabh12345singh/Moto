package com.example.MotoShare.service;

import com.example.MotoShare.entity.*;
import com.example.MotoShare.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

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
 *
 * Also includes a concurrent cancellation stress test to verify our new
 * cancellation locking works correctly under pressure.
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
        System.out.println("==============================================");

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

        // NEW: Verify the booking has CONFIRMED status (not computed from time)
        Booking savedBooking = bookingRepository.findAll().get(0);
        assertEquals(BookingStatus.CONFIRMED, savedBooking.getStatus(),
                "Booking should have CONFIRMED status!");
    }

    /**
     * NEW TEST: Concurrent Cancellation Stress Test
     *
     * WHY test concurrent cancellation?
     * Scenario: User rapidly double-clicks "Cancel" or has a buggy frontend.
     * Without proper locking, two threads could both read status=CONFIRMED,
     * both cancel, and both restore the slot — creating a ghost available slot.
     *
     * This test verifies that only ONE cancellation succeeds and the slot
     * is restored exactly once.
     */
    @Test
    public void testConcurrentCancellationsOnlyOneSucceeds() throws InterruptedException {
        // First, create a valid booking (single-threaded, deterministic)
        Long firstTakerId = takerUserIds.get(0);
        bookBikeService.bookBike(testSlotId, startTime, endTime, firstTakerId);

        // Verify booking was created
        List<Booking> bookings = bookingRepository.findAll();
        assertEquals(1, bookings.size());
        Long bookingId = bookings.get(0).getId();

        // Now fire 10 concurrent cancellation attempts on the same booking
        int cancelThreads = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(cancelThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(cancelThreads);

        AtomicInteger cancelSuccess = new AtomicInteger(0);
        AtomicInteger cancelFailure = new AtomicInteger(0);

        for (int i = 0; i < cancelThreads; i++) {
            executorService.submit(() -> {
                try {
                    startLatch.await();
                    bookBikeService.cancelBooking(bookingId, firstTakerId);
                    cancelSuccess.incrementAndGet();
                } catch (Exception e) {
                    cancelFailure.incrementAndGet();
                } finally {
                    endLatch.countDown();
                }
            });
        }

        // Release all threads simultaneously
        startLatch.countDown();
        boolean finished = endLatch.await(15, TimeUnit.SECONDS);
        assertTrue(finished, "Not all cancellation threads finished!");
        executorService.shutdown();

        System.out.println("========== CANCELLATION TEST RESULT ==========");
        System.out.println("Successful cancellations: " + cancelSuccess.get());
        System.out.println("Failed cancellations: " + cancelFailure.get());
        System.out.println("===============================================");

        // Exactly 1 cancellation must succeed
        assertEquals(1, cancelSuccess.get(),
                "Concurrency Failure: More than 1 cancellation succeeded!");

        // 9 must fail (booking already cancelled)
        assertEquals(9, cancelFailure.get(),
                "Concurrency Failure: Failed cancellation count mismatch!");

        // The booking must be CANCELLED
        Booking cancelledBooking = bookingRepository.findById(bookingId).orElseThrow();
        assertEquals(BookingStatus.CANCELLED, cancelledBooking.getStatus(),
                "Booking status should be CANCELLED!");
        assertNotNull(cancelledBooking.getCancelledAt(),
                "Cancelled booking must have a cancellation timestamp!");

        // The slot must be restored to available
        AvailabilitySlot restoredSlot = availabilitySlotRepository.findById(testSlotId).orElseThrow();
        assertTrue(restoredSlot.getIsAvailable(),
                "Slot should be restored to available after cancellation!");
    }
}
