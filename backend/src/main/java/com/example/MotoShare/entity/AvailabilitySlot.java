package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "availability_slots")
@Getter @Setter
public class AvailabilitySlot {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "bike_id")
    private Bike bike;

    private LocalDateTime startHour;
    private LocalDateTime endHour;

    private Long pricePerHour;

    private Boolean isAvailable; // true if slot is available for booking

    private String city;              // e.g. Delhi, Jaipur
    private String pickupLocation;    // e.g. Metro Gate 3, CP
}
