package com.blooddonor.dto.request;

import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.Gender;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PatientUpdateRequest {

    private String patientName;

    @Min(value = 0, message = "Age must be zero or greater")
    private Integer age;

    private Gender gender;
    private BloodType bloodType;

    @Min(value = 1, message = "Units required must be at least 1")
    private Integer unitsRequired;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reasonForBlood;

    private LocalDate requiredBeforeDate;
}
