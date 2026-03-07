package com.example.MotoShare.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddBikeRequestDto {
    private String company;
    private String model;
    private Long ratePerHour;
    private String bikeNumber;
    private String rcNumber;
    private Long kms;
    private String imageUrl;
}

