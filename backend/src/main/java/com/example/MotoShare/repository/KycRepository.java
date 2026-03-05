package com.example.MotoShare.repository;

import com.example.MotoShare.entity.Kyc;
import com.example.MotoShare.entity.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KycRepository extends JpaRepository<Kyc, Long> {

    // find
    Optional<Kyc> findByUserId(Long userId);

    // find all by status (for admin pending list)
    List<Kyc> findByStatus(KycStatus status);

    // delete (BEST for reject)
    void deleteByUserId(Long userId);

    // optional safety
    boolean existsByUserId(Long userId);
}