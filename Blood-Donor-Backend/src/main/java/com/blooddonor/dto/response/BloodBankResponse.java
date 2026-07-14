package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BloodBankResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}