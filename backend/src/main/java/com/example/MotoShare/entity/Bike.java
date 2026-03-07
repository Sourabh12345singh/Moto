package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "bikes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "bike_number")
        }
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Bike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bike_id")
    private Long bikeId;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "biker_id",       // SAME as biker.user_id
            nullable = false
    )
    private Biker biker;

    private String company;
    private String model;

    @Column(nullable = false)
    private Long ratePerHour;

    @Column(name = "bike_number", nullable = false, unique = true)
    private String bikeNumber;

    @Column(name = "rc_number", nullable = false)
    private String rcNumber;

    private Long kms;

    @Column(name = "image_url")
    private String imageUrl;
}

