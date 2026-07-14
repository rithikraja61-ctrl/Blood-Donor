package com.blooddonor.dto.request;

import com.blooddonor.validation.BloodType;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DonorUpdateRequest {

    private String name;
    private String phoneNumber;
    private String address;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private BloodType bloodType;
    private Boolean available;
}