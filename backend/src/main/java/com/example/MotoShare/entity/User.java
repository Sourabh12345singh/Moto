package com.example.MotoShare.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private Long phoneNo;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role; // BIKER / TAKER

    @Enumerated(EnumType.STRING)
    private KycStatus kycStatus = KycStatus.NOT_SUBMITTED;

    /**
     * WHY @Version on User?
     *
     * Scenario: Admin A opens KYC review for user #5 and approves.
     * Admin B loaded the same page earlier and clicks "reject."
     * Without @Version, B's stale write silently overwrites A's approval.
     *
     * With @Version, JPA detects the mismatch and throws OptimisticLockException.
     * Our GlobalExceptionHandler catches it and returns HTTP 409:
     * "This record was modified by another user. Please refresh."
     */
    @Version
    private Long version;

    // ===== Spring Security methods =====

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email; // Spring Security uses email as the username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
