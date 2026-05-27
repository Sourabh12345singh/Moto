package com.example.MotoShare.repository;

import com.example.MotoShare.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser_UserIdOrderByStartTimeDesc(Long userId);

    List<Booking> findByBike_BikeIdInOrderByStartTimeDesc(List<Long> bikeIds);
}