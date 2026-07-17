package com.blooddonor.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateHospitalRequestDto {

    @NotNull(message = "Blood bank id is required")
    private Long bloodBankId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @Min(value = 0, message = "Patient age must be zero or greater")
    private int patientAge;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Blood group is required")
    private String bloodGroup;

    @Min(value = 1, message = "Required units must be at least 1")
    private int requiredUnits;

    @NotBlank(message = "Emergency level is required")
    private String emergencyLevel;

    @NotBlank(message = "Reason is required")
    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;

    @NotNull(message = "Required before date is required")
    @Future(message = "Required before date must be in the future")
    private LocalDateTime requiredBefore;

    @NotBlank(message = "Hospital contact is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Hospital contact must be 10 to 15 digits")
    private String hospitalContact;
}
