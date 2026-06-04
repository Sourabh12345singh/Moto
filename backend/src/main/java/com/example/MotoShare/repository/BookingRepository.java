package com.example.MotoShare.repository;

import com.example.MotoShare.entity.Booking;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser_UserIdOrderByStartTimeDesc(Long userId);

    List<Booking> findByBike_BikeIdInOrderByStartTimeDesc(List<Long> bikeIds);

    /**
     * WHY Pessimistic Lock on booking cancellation?
     *
     * Scenario: User clicks "Cancel" twice rapidly (double-click, laggy UI).
     * Thread 1 reads booking (status=CONFIRMED), starts cancellation.
     * Thread 2 reads the same booking (still CONFIRMED, Thread 1 hasn't committed yet).
     * Both threads try to restore the slot → duplicate available slots!
     *
     * By locking the row with SELECT FOR UPDATE, Thread 2 waits until Thread 1
     * finishes. When Thread 2 finally reads, it sees status=CANCELLED and aborts.
     *
     * Same technique we use for booking creation — applied to the reverse lifecycle operation.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :bookingId")
    Optional<Booking> findByIdForUpdate(@Param("bookingId") Long bookingId);
}