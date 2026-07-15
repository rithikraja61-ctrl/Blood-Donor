package com.blooddonor.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
public class HospitalUpdateRequest {

    private String name;
    private String phoneNumber;
    private String address;
    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
    private String pincode;
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}