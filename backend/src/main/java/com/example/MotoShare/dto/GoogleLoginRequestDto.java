package com.example.MotoShare.dto;

import com.example.MotoShare.entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleLoginRequestDto {

    @NotBlank(message = "Authorization code is required")
    private String code;

    private String redirectUri;

    private Role role; // Optional: BIKER / TAKER (defaults to TAKER if new registration)
}
