package com.example.MotoShare.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class BookBikeRequestDto {
    private UUID slotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
