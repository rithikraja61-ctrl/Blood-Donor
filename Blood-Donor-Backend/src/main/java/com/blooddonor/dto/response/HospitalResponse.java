package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class HospitalResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String licenseNumber;
    private String profileImageUrl;
    private LocalDateTime registrationDate;
    private LocalDateTime updatedAt;
    private Double latitude;
    private Double longitude;
}
