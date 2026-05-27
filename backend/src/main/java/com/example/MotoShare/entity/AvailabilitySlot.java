package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "availability_slots",
        indexes = {
                @Index(name = "idx_slot_city_avail_start", columnList = "city, is_available, start_hour")
        }
)
@Getter @Setter
@Check(constraints = "start_hour < end_hour")
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
