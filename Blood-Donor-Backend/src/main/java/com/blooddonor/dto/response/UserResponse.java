package com.blooddonor.dto.response;

import com.blooddonor.validation.BloodType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private BloodType bloodType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String pincode;
}