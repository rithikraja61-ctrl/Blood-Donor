package com.blooddonor.dto.request;

import com.blooddonor.validation.BloodType;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import jakarta.validation.constraints.Pattern;
import lombok.Setter;

@Getter
@Setter
public class DonorUpdateRequest extends LocationRequest {

    private String name;
    private String phoneNumber;
    private String address;
    private String city;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
    private String pincode;

    private BloodType bloodType;
    private Boolean available;
}
