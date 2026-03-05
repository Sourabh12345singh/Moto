package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;


@Entity
@Table(name = "taker")
@Getter @Setter
public class Taker {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id" , nullable = false)
    private User user;



    private BigDecimal rating;

    private int totalRatings;

}

