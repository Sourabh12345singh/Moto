package com.example.MotoShare.controller;

import com.example.MotoShare.dto.AddAvailabilitySlotDto;
import com.example.MotoShare.dto.AddBikeRequestDto;
import com.example.MotoShare.dto.BookingResponseDto;
import com.example.MotoShare.entity.User;
import com.example.MotoShare.service.AvailabilitySlotService;
import com.example.MotoShare.service.BikeAddinginSlotService;
import com.example.MotoShare.service.BikerAddingBikeDetailsService;
import com.example.MotoShare.service.BookBikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/biker")
@RequiredArgsConstructor
public class BikerController {

    private final BikerAddingBikeDetailsService bikeService;
    private final BikeAddinginSlotService bikeAddinginSlotService;
    private final BookBikeService bookBikeService;

    // 1️⃣ Add bike
    @PostMapping("/{bikerID}/bike")
    public ResponseEntity<String> addBike(
            @PathVariable Long bikerID,
            @RequestBody AddBikeRequestDto dto
    ) {
        bikeService.addBikeDetails(dto , bikerID );
        return ResponseEntity.ok("Bike added successfully");
    }

    // 2️⃣ Add availability slot
    @PostMapping("/bike/{bikeId}/slot")
    public ResponseEntity<String> addSlot(
            @PathVariable Long bikeId,
            @RequestBody AddAvailabilitySlotDto dto
    ) {
        bikeAddinginSlotService.addSlot(bikeId, dto);
        return ResponseEntity.ok("Slot added successfully");
    }

    // 3. Get all bookings for this biker's bikes
    @GetMapping("/my-bookings")
    public ResponseEntity<java.util.List<BookingResponseDto>> getMyBookings(
            @AuthenticationPrincipal User user
    ) {
        java.util.List<BookingResponseDto> bookings = bookBikeService.getBookingsForBiker(user.getUserId());
        return ResponseEntity.ok(bookings);
    }

}
