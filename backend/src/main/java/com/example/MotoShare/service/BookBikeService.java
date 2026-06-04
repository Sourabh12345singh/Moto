package com.example.MotoShare.service;

import com.example.MotoShare.dto.BookingResponseDto;
import com.example.MotoShare.entity.*;
import com.example.MotoShare.error.BusinessRuleException;
import com.example.MotoShare.error.ResourceNotFoundException;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import com.example.MotoShare.repository.BikeRepository;
import com.example.MotoShare.repository.BookingRepository;
import com.example.MotoShare.repository.UserRepository;
import com.example.MotoShare.service.notification.NotificationStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookBikeService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final BookingRepository bookingRepository;
    private final BikeRepository bikeRepository;
    private final UserRepository userRepository;
    private final List<NotificationStrategy> notificationStrategies;

    private static final int BUFFER_MINUTES = 30;
    private static final int MIN_BOOKING_HOURS = 1;
    private static final int MIN_REMAINING_SLOT_MINUTES = 60; // 1 hour minimum for a leftover slot
    private static final int MIN_CANCEL_MINUTES_BEFORE_START = 60; // Can't cancel within 1 hour of start

    @Transactional
    public void bookBike(
            UUID slotId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long userId
    ) {

        // 0. KYC enforcement -- user must be APPROVED before booking
        /*
         * WHY check KYC first, before locking the slot?
         * Because acquiring a pessimistic lock is EXPENSIVE (blocks other threads).
         * If the user isn't even KYC-approved, we should fail FAST without wasting
         * a database lock. Always put cheap checks before expensive ones.
         */
        User bookingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (bookingUser.getKycStatus() != KycStatus.APPROVED) {
            throw new BusinessRuleException("KYC verification required before booking. Please complete your KYC.");
        }

        // 1. Fetch slot (uses Pessimistic Write Lock to prevent race conditions / double bookings)
        /*
         * WHY PESSIMISTIC_WRITE here?
         * This is the heart of our concurrency control. SELECT FOR UPDATE locks
         * this specific row in PostgreSQL. Any other transaction trying to read
         * or modify this same slot BLOCKS until we commit or rollback.
         *
         * Without this: 50 threads all see isAvailable=true and create 50 bookings.
         * With this: Thread 1 locks the row, creates 1 booking, sets isAvailable=false.
         *            Threads 2-50 wait, then see isAvailable=false and throw BusinessRuleException.
         */
        AvailabilitySlot slot = availabilitySlotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability Slot", slotId));

        // 2. Check availability
        if (!Boolean.TRUE.equals(slot.getIsAvailable())) {
            throw new BusinessRuleException("Slot is no longer available");
        }

        // 3. Validate: booking times must be within slot window
        if (startTime.isBefore(slot.getStartHour()) || endTime.isAfter(slot.getEndHour())) {
            throw new BusinessRuleException("Booking times must be within the available slot window ("
                    + slot.getStartHour() + " to " + slot.getEndHour() + ")");
        }

        // 4. Validate: start must be before end
        if (!startTime.isBefore(endTime)) {
            throw new BusinessRuleException("Start time must be before end time");
        }

        // 5. Validate: minimum 1 hour booking
        long bookingMinutes = Duration.between(startTime, endTime).toMinutes();
        if (bookingMinutes < MIN_BOOKING_HOURS * 60) {
            throw new BusinessRuleException("Minimum booking duration is " + MIN_BOOKING_HOURS + " hour(s)");
        }

        // 6. Create booking with CONFIRMED status
        Booking booking = new Booking();
        booking.setBike(slot.getBike());
        booking.setUser(bookingUser);
        booking.setSlot(slot);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus(BookingStatus.CONFIRMED);

        long hours = (long) Math.ceil(bookingMinutes / 60.0);
        booking.setTotalPrice(hours * slot.getPricePerHour());

        bookingRepository.save(booking);

        // 7. Mark original slot as unavailable
        slot.setIsAvailable(false);
        availabilitySlotRepository.save(slot);

        // 8. Slot splitting -- create new available slots for remaining time

        // 8a. Pre-booking remainder: slot.startHour -> booking startTime
        // If there's at least 1 hour before the booking starts, create a new slot
        long preGapMinutes = Duration.between(slot.getStartHour(), startTime).toMinutes();
        if (preGapMinutes >= MIN_REMAINING_SLOT_MINUTES) {
            AvailabilitySlot preSlot = new AvailabilitySlot();
            preSlot.setBike(slot.getBike());
            preSlot.setStartHour(slot.getStartHour());
            preSlot.setEndHour(startTime);
            preSlot.setPricePerHour(slot.getPricePerHour());
            preSlot.setIsAvailable(true);
            preSlot.setCity(slot.getCity());
            preSlot.setPickupLocation(slot.getPickupLocation());
            availabilitySlotRepository.save(preSlot);
        }

        // 8b. Post-booking remainder: (booking endTime + 30 min buffer) -> slot.endHour
        // The 30-min buffer gives the biker time to get the bike back / prepare it
        LocalDateTime postAvailableStart = endTime.plusMinutes(BUFFER_MINUTES);
        long postGapMinutes = Duration.between(postAvailableStart, slot.getEndHour()).toMinutes();
        if (postGapMinutes >= MIN_REMAINING_SLOT_MINUTES) {
            AvailabilitySlot postSlot = new AvailabilitySlot();
            postSlot.setBike(slot.getBike());
            postSlot.setStartHour(postAvailableStart);
            postSlot.setEndHour(slot.getEndHour());
            postSlot.setPricePerHour(slot.getPricePerHour());
            postSlot.setIsAvailable(true);
            postSlot.setCity(slot.getCity());
            postSlot.setPickupLocation(slot.getPickupLocation());
            availabilitySlotRepository.save(postSlot);
        }

        // 9. Dispatch notifications via all active Notification Strategies (Strategy Pattern / Open-Closed Principle)
        try {
            User taker = bookingUser;
            Bike bike = slot.getBike();
            User biker = bike.getBiker().getUser();

            if (taker != null && biker != null) {
                for (NotificationStrategy strategy : notificationStrategies) {
                    try {
                        strategy.sendBookingConfirmation(taker, bike, slot, booking);
                        strategy.sendBookingNotification(biker, taker, bike, slot, booking);
                    } catch (Exception e) {
                        log.error("Notification strategy {} failed: {}", strategy.getClass().getSimpleName(), e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch booking notifications: {}", e.getMessage());
        }
    }

    /**
     * Cancel an existing booking and restore the slot to available.
     *
     * WHY is cancellation a separate transactional method with its own pessimistic lock?
     *
     * 1. We need to prevent double-cancellation (user clicks cancel twice quickly).
     *    The PESSIMISTIC_WRITE lock on booking ensures only one thread processes it.
     *
     * 2. We need to restore the original slot to "available" so other users can book it.
     *    This must happen atomically within the same transaction as the status change.
     *    If we set status=CANCELLED but crash before restoring the slot, the slot is
     *    permanently lost. @Transactional ensures both happen or neither happens.
     *
     * 3. We enforce a business rule: no cancellation within 1 hour of ride start.
     *    This protects bikers who have already traveled to the pickup location.
     */
    @Transactional
    public void cancelBooking(Long bookingId, Long userId) {

        // Lock the booking row to prevent concurrent cancel/modify race conditions
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        // Verify ownership — users can only cancel their own bookings
        if (!booking.getUser().getUserId().equals(userId)) {
            throw new BusinessRuleException("You can only cancel your own bookings");
        }

        // Verify the booking is in a cancellable state
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BusinessRuleException("Only CONFIRMED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        // Enforce cancellation window: must be at least 1 hour before ride start
        /*
         * WHY this restriction?
         * If the biker has already traveled to the pickup location (Connaught Place, Gate 2),
         * a last-second cancellation wastes their time and fuel. Real platforms (Uber, Ola)
         * charge cancellation fees for late cancellations. We block them entirely for simplicity.
         */
        long minutesUntilStart = Duration.between(LocalDateTime.now(), booking.getStartTime()).toMinutes();
        if (minutesUntilStart < MIN_CANCEL_MINUTES_BEFORE_START) {
            throw new BusinessRuleException(
                    "Cannot cancel within " + MIN_CANCEL_MINUTES_BEFORE_START + " minutes of ride start time"
            );
        }

        // Perform cancellation
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Restore the original slot to available
        /*
         * WHY restore the slot?
         * Without this, a cancelled booking's slot stays permanently locked.
         * No other user can ever book that time window again.
         * This is the "slot recovery" part of the cancellation lifecycle.
         */
        AvailabilitySlot slot = booking.getSlot();
        slot.setIsAvailable(true);
        availabilitySlotRepository.save(slot);

        log.info("Booking {} cancelled by user {}. Slot {} restored to available.",
                bookingId, userId, slot.getId());
    }

    /**
     * Get all bookings for a TAKER user.
     *
     * WHY @Transactional(readOnly = true)?
     *
     * 1. PERFORMANCE: Hibernate runs "dirty checking" on every loaded entity (comparing
     *    all fields to detect changes). For read-only queries, this is wasted CPU.
     *    readOnly=true tells Hibernate to skip dirty checking entirely.
     *
     * 2. DATABASE OPTIMIZATION: PostgreSQL can route readOnly transactions to read
     *    replicas in a horizontally scaled deployment. Without this flag, all queries
     *    hit the primary (write) database, creating an unnecessary bottleneck.
     *
     * 3. INTENT DECLARATION: It documents that this method should NEVER modify data.
     *    If a developer accidentally adds a .save() call inside, the transaction
     *    manager will throw an exception, catching the bug at development time.
     */
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getBookingsForUser(Long userId) {
        List<Booking> bookings = bookingRepository.findByUser_UserIdOrderByStartTimeDesc(userId);
        return bookings.stream()
                .map(this::toBookingResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings for a BIKER's bikes.
     */
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getBookingsForBiker(Long userId) {
        List<Bike> bikes = bikeRepository.findByBikerUserId(userId);
        if (bikes.isEmpty()) {
            return List.of();
        }
        List<Long> bikeIds = bikes.stream()
                .map(Bike::getBikeId)
                .collect(Collectors.toList());
        List<Booking> bookings = bookingRepository.findByBike_BikeIdInOrderByStartTimeDesc(bikeIds);
        return bookings.stream()
                .map(this::toBookingResponseDto)
                .collect(Collectors.toList());
    }

    private BookingResponseDto toBookingResponseDto(Booking booking) {
        Bike bike = booking.getBike();
        AvailabilitySlot slot = booking.getSlot();

        // Fetch slot info directly from relationship (prevents N+1 database queries)
        String city = slot != null ? slot.getCity() : "";
        String pickupLocation = slot != null ? slot.getPickupLocation() : "";
        Long pricePerHour = slot != null ? slot.getPricePerHour() : 0L;

        long durationMinutes = Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes();
        long durationHours = (long) Math.ceil(durationMinutes / 60.0);

        /*
         * WHY use the persistent status field instead of computing from timestamps?
         *
         * Before: String status = endTime.isAfter(now) ? "UPCOMING" : "COMPLETED"
         *   Problem: A CANCELLED booking with a future endTime would show as "UPCOMING"
         *   instead of "CANCELLED" — because time-based logic can't represent user actions.
         *
         * After: We use the stored BookingStatus enum directly.
         *   For backward compatibility with the frontend (which expects "UPCOMING"),
         *   we map CONFIRMED to "UPCOMING" if the ride hasn't started yet.
         */
        String status;
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            status = "CANCELLED";
        } else if (booking.getEndTime().isAfter(LocalDateTime.now())) {
            status = "UPCOMING";
        } else {
            status = "COMPLETED";
        }

        return BookingResponseDto.builder()
                .id(booking.getId())
                .bikeCompany(bike != null ? bike.getCompany() : "Unknown")
                .bikeModel(bike != null ? bike.getModel() : "Unknown")
                .city(city)
                .pickupLocation(pickupLocation)
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalPrice(booking.getTotalPrice())
                .pricePerHour(pricePerHour)
                .durationHours(durationHours)
                .status(status)
                .build();
    }
}
