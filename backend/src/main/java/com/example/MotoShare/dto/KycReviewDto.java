package com.example.MotoShare.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class KycReviewDto {

    private Long userId;
    private String name;
    private String email;
    private Long phoneNo;

    private String selfieUrl;
    private String licenceUrl;
    private String panNo;
    private String aadhaarNo;
}
