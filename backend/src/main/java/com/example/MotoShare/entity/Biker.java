package com.example.MotoShare.entity;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "biker")
@Getter @Setter

public class Biker {

    @Id
    private Long userId;   // SAME as users.user_id

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BigDecimal rating = BigDecimal.ZERO;
    private int totalRatings = 0;

    @OneToMany(mappedBy = "biker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bike> bikes = new ArrayList<>();
}

