package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "kyc")
@Getter
@Setter
public class Kyc {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;   // <-- your own User entity

    private String selfieUrl;
    private String licenceUrl;
    private String panNo;
    private String aadhaarNo;

    @Enumerated(EnumType.STRING)
    private KycStatus status;

    private Instant verifiedAt;
}
