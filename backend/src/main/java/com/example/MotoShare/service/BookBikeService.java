package com.example.MotoShare.service;

import com.example.MotoShare.dto.BookingResponseDto;
import com.example.MotoShare.entity.AvailabilitySlot;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.entity.Booking;
import com.example.MotoShare.entity.KycStatus;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.repository.AvailabilitySlotRepository;
import com.example.MotoShare.repository.BikeRepository;
import com.example.MotoShare.repository.BookingRepository;
import com.example.MotoShare.repository.UserRepository;
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
    private final EmailService emailService;

    private static final int BUFFER_MINUTES = 30;
    private static final int MIN_BOOKING_HOURS = 1;
    private static final int MIN_REMAINING_SLOT_MINUTES = 60; // 1 hour minimum for a leftover slot

    @Transactional
    public void bookBike(
            UUID slotId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long userId
    ) {

        // 0. KYC enforcement -- user must be APPROVED before booking
        User bookingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (bookingUser.getKycStatus() != KycStatus.APPROVED) {
            throw new RuntimeException("KYC verification required before booking. Please complete your KYC.");
        }

        // 1. Fetch slot
        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // 2. Check availability
        if (!Boolean.TRUE.equals(slot.getIsAvailable())) {
            throw new RuntimeException("Slot is no longer available");
        }

        // 3. Validate: booking times must be within slot window
        if (startTime.isBefore(slot.getStartHour()) || endTime.isAfter(slot.getEndHour())) {
            throw new RuntimeException("Booking times must be within the available slot window ("
                    + slot.getStartHour() + " to " + slot.getEndHour() + ")");
        }

        // 4. Validate: start must be before end
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }

        // 5. Validate: minimum 1 hour booking
        long bookingMinutes = Duration.between(startTime, endTime).toMinutes();
        if (bookingMinutes < MIN_BOOKING_HOURS * 60) {
            throw new RuntimeException("Minimum booking duration is " + MIN_BOOKING_HOURS + " hour(s)");
        }

        // 6. Create booking
        Booking booking = new Booking();
        booking.setBikeId(slot.getBike().getBikeId());
        booking.setUserId(userId);
        booking.setSlotId(slotId);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);

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

        // 9. Send email notifications (async -- won't block the booking response)
        try {
            Bike bike = slot.getBike();
            String bikeName = bike.getCompany() + " " + bike.getModel();

            // Taker email
            User taker = userRepository.findById(userId)
                    .orElse(null);
            if (taker != null) {
                emailService.sendBookingConfirmationToTaker(
                        taker.getEmail(), taker.getName(),
                        bikeName, slot.getCity(), slot.getPickupLocation(),
                        startTime, endTime, booking.getTotalPrice()
                );
            }

            // Biker email
            User bikerUser = bike.getBiker().getUser();
            if (bikerUser != null) {
                emailService.sendBookingNotificationToBiker(
                        bikerUser.getEmail(), bikerUser.getName(),
                        bikeName,
                        taker != null ? taker.getName() : "A rider",
                        taker != null ? taker.getEmail() : "",
                        slot.getCity(), slot.getPickupLocation(),
                        startTime, endTime, booking.getTotalPrice()
                );
            }
        } catch (Exception e) {
            // Email failure should never break the booking, but log it
            log.warn("Failed to send booking notification emails: {}", e.getMessage());
        }
    }

    /**
     * Get all bookings for a TAKER user.
     */
    public List<BookingResponseDto> getBookingsForUser(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByStartTimeDesc(userId);
        return bookings.stream()
                .map(this::toBookingResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings for a BIKER's bikes.
     */
    public List<BookingResponseDto> getBookingsForBiker(Long userId) {
        List<Bike> bikes = bikeRepository.findByBikerUserId(userId);
        if (bikes.isEmpty()) {
            return List.of();
        }
        List<Long> bikeIds = bikes.stream()
                .map(Bike::getBikeId)
                .collect(Collectors.toList());
        List<Booking> bookings = bookingRepository.findByBikeIdInOrderByStartTimeDesc(bikeIds);
        return bookings.stream()
                .map(this::toBookingResponseDto)
                .collect(Collectors.toList());
    }

    private BookingResponseDto toBookingResponseDto(Booking booking) {
        Bike bike = bikeRepository.findById(booking.getBikeId()).orElse(null);

        // Fetch slot info for city/pickupLocation
        String city = "";
        String pickupLocation = "";
        Long pricePerHour = 0L;
        if (booking.getSlotId() != null) {
            AvailabilitySlot slot = availabilitySlotRepository.findById(booking.getSlotId()).orElse(null);
            if (slot != null) {
                city = slot.getCity();
                pickupLocation = slot.getPickupLocation();
                pricePerHour = slot.getPricePerHour();
            }
        }

        long durationMinutes = Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes();
        long durationHours = (long) Math.ceil(durationMinutes / 60.0);

        String status = booking.getEndTime().isAfter(LocalDateTime.now()) ? "UPCOMING" : "COMPLETED";

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
