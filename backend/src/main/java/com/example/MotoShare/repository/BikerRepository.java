package com.example.MotoShare.repository;

import com.example.MotoShare.entity.Biker;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface BikerRepository extends JpaRepository<Biker, Long> {

//   Biker FindById(Long userId);

}