package com.example.MotoShare.repository;

import com.example.MotoShare.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface BikeRepository extends JpaRepository<Bike, Long> {
    boolean existsByBikeNumber( String bikeNumber);

    List<Bike> findByBikerUserId(Long userId);
}