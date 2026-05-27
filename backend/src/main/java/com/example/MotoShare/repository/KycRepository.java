package com.example.MotoShare.repository;

import com.example.MotoShare.entity.Kyc;
import com.example.MotoShare.entity.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KycRepository extends JpaRepository<Kyc, Long> {

    Optional<Kyc> findByUserId(Long userId);

    List<Kyc> findByStatus(KycStatus status);

    void deleteByUserId(Long userId);
}