package com.example.MotoShare.controller;

import com.example.MotoShare.dto.AvailableBikeResponseDTO;
import com.example.MotoShare.dto.BookBikeRequestDto;
import com.example.MotoShare.dto.BookingResponseDto;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.service.AvailabilitySlotService;
import com.example.MotoShare.service.BookBikeService;
import com.example.MotoShare.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AvailabilitySlotService availabilitySlotService;
    private final BookBikeService bookBikeService;
    private final UserService userService;

    @GetMapping("/me/status")
    public ResponseEntity<Map<String, Object>> getMyStatus(@AuthenticationPrincipal User user) {
        User freshUser = userService.getUserByEmail(user.getEmail());

        Map<String, Object> status = Map.of(
                "userId", freshUser.getUserId(),
                "email", freshUser.getEmail(),
                "name", freshUser.getName(),
                "role", freshUser.getRole().name(),
                "kycStatus", freshUser.getKycStatus().name()
        );

        return ResponseEntity.ok(status);
    }

    @GetMapping("/bikes")
    public List<AvailableBikeResponseDTO> getAvailableBikes(
            @RequestParam String city) {
        return availabilitySlotService.getAvailableSlots(city);
    }

    /**
     * WHY @Valid here?
     *
     * @Valid triggers Bean Validation on the BookBikeRequestDto BEFORE the method body executes.
     * If slotId is null, the request is immediately rejected with HTTP 400 and a clean error:
     *   { "error": "slotId: Slot ID is required", "statusCode": "BAD_REQUEST" }
     *
     * Without @Valid, the null slotId would pass through to the service layer,
     * crash inside availabilitySlotRepository.findByIdForUpdate(null), and produce
     * a cryptic 500 error with a Hibernate stack trace.
     */
    @PostMapping("/book")
    public ResponseEntity<String> bookBike(
            @Valid @RequestBody BookBikeRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        bookBikeService.bookBike(
                dto.getSlotId(),
                dto.getStartTime(),
                dto.getEndTime(),
                user.getUserId()
        );
        return ResponseEntity.ok("Booking confirmed successfully!");
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(
            @AuthenticationPrincipal User user
    ) {
        List<BookingResponseDto> bookings = bookBikeService.getBookingsForUser(user.getUserId());
        return ResponseEntity.ok(bookings);
    }

    /**
     * Cancel an existing booking.
     *
     * WHY a separate endpoint instead of a PUT/PATCH on the booking?
     *
     * Cancellation is an ACTION with side effects (slot restoration, potential refund),
     * not a simple field update. Using POST /cancel makes the intent explicit in the URL
     * and prevents accidental cancellation via a generic "update booking" API.
     *
     * REST purists might argue for PATCH /bookings/{id} with body { "status": "CANCELLED" },
     * but for a booking platform, explicit action endpoints are clearer and safer.
     */
    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal User user
    ) {
        bookBikeService.cancelBooking(bookingId, user.getUserId());
        return ResponseEntity.ok("Booking cancelled successfully. Slot has been restored.");
    }
}
