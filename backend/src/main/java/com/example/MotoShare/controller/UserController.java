package com.example.MotoShare.controller;

import com.example.MotoShare.dto.AvailableBikeResponseDTO;
import com.example.MotoShare.dto.BookBikeRequestDto;
import com.example.MotoShare.dto.BookingResponseDto;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.service.AvailabilitySlotService;
import com.example.MotoShare.service.BookBikeService;
import com.example.MotoShare.service.UserService;
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

    @PostMapping("/book")
    public ResponseEntity<String> bookBike(
            @RequestBody BookBikeRequestDto dto,
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
}
