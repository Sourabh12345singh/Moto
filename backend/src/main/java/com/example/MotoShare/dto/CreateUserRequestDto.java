package com.example.MotoShare.dto;

import com.example.MotoShare.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/**
 * WHY Bean Validation annotations here?
 *
 * Without these, sending { "email": "", "password": null } to /register
 * passes through the controller unchecked, hits the database, and throws
 * a cryptic Hibernate constraint error: "could not execute statement; constraint [UK_6dotkott2kjsp8vw4d0m25fb7]"
 *
 * With these, the request is rejected IMMEDIATELY at the API boundary with
 * a clean 400: "email: must not be blank; password: size must be between 6 and 100"
 *
 * This is the "Fail-Fast Principle": validate input at the earliest possible point
 * so errors are caught before wasting CPU, DB connections, or network calls.
 */
@Getter
@Setter
public class CreateUserRequestDto {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotNull(message = "Phone number is required")
    private Long phoneNo;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @NotNull(message = "Role is required (BIKER or TAKER)")
    private Role role;
}
