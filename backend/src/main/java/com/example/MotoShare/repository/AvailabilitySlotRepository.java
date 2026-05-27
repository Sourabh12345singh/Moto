package com.example.MotoShare.repository;

import com.example.MotoShare.entity.AvailabilitySlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

    @Query("""
    SELECT a
    FROM AvailabilitySlot a
    JOIN FETCH a.bike b
    JOIN FETCH b.biker
    WHERE LOWER(a.city) = LOWER(:city)
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

    /**
     * Fetch a slot and lock the corresponding database row pessimistically for updates.
     * Prevents other concurrent booking requests from acquiring this slot during the transaction.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.id = :slotId")
    Optional<AvailabilitySlot> findByIdForUpdate(@Param("slotId") UUID slotId);

}
