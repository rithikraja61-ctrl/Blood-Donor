package com.blooddonor.dto.response;

import com.blooddonor.validation.BloodType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class DonorResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String pincode;
    private String city;
    private BloodType bloodType;
    private boolean available;
    private boolean active;
    private boolean blocked;
    private LocalDate lastDonationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double latitude;
    private Double longitude;
}
