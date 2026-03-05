package com.example.MotoShare.repository;

import com.example.MotoShare.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

//    // 1️⃣ Check if new slot overlaps with existing slots
//    @Query("""
//        SELECT COUNT(a) > 0
//        FROM AvailabilitySlot a
//        WHERE a.city = :city
//          AND a.isAvailable = true
//          AND a.startHour < :end
//          AND a.endHour > :start
//    """)
//    boolean existsOverlappingSlot(
//            @Param("city") String city,
//            @Param("start") LocalDateTime start,
//            @Param("end") LocalDateTime end
//    );

    // 2️⃣ Fetch all available slots for the next 7 days in a city
    @Query("""
    SELECT a
    FROM AvailabilitySlot a
    WHERE a.city = :city
      AND a.isAvailable = true
      AND a.startHour >= :now
      AND a.startHour <= :maxDate
    ORDER BY a.startHour
""")
    List<AvailabilitySlot> findAvailableSlotsForNext7Days(
            @Param("city") String city,
            @Param("now") LocalDateTime now,
            @Param("maxDate") LocalDateTime maxDate
    );

}
