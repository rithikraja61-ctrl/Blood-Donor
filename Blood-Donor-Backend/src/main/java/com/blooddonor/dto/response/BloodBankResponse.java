package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BloodBankResponse {

    private Long id;
    private String bloodBankName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String licenseNumber;
    private String profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double latitude;
    private Double longitude;
}