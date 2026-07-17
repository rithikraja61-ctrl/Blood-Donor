package com.blooddonor.dto.request;

import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.Gender;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PatientCreateRequest {

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @Min(value = 0, message = "Age must be zero or greater")
    private int age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "Blood type is required")
    private BloodType bloodType;

    @Min(value = 1, message = "Units required must be at least 1")
    private int unitsRequired;

    @NotBlank(message = "Reason for blood requirement is required")
    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reasonForBlood;

    @NotNull(message = "Required before date is required")
    private LocalDate requiredBeforeDate;
}
