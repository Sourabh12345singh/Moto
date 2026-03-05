package com.example.MotoShare.dto;

import com.example.MotoShare.entity.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequestDto {
    private String name;
    private String email;
    private Long phoneNo;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role; // BIKER / TAKER


}

