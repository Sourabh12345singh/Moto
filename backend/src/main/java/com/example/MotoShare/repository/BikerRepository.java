package com.example.MotoShare.repository;

import com.example.MotoShare.entity.Biker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BikerRepository extends JpaRepository<Biker, Long> {
}