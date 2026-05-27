package com.example.MotoShare.repository;

import com.example.MotoShare.entity.FailedNotification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FailedNotificationRepository extends JpaRepository<FailedNotification, Long> {
}
