package com.blooddonor.dto.request;

import com.blooddonor.validation.EmergencyLevel;
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

    @NotNull(message = "Patient id is required")
    private Long patientId;

    @NotNull(message = "Emergency level is required")
    private EmergencyLevel emergencyLevel;

    @NotNull(message = "Required before date is required")
    private LocalDateTime requiredBefore;

    @NotBlank(message = "Hospital contact is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Hospital contact must be 10 to 15 digits")
    private String hospitalContact;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
}
