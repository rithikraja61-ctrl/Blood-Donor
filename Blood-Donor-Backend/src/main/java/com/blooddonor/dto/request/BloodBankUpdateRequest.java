package com.blooddonor.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BloodBankUpdateRequest {

    private String name;
    private String phoneNumber;
    private String address;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}