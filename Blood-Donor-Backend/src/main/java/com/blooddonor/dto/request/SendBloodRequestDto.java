package com.blooddonor.dto.request;

import com.blooddonor.validation.EmergencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SendBloodRequestDto extends LocationRequest {

    @NotNull(message = "Patient id is required")
    private Long patientId;

    @NotBlank(message = "Contact person name is required")
    private String contactPersonName;

    @NotBlank(message = "Contact phone number is required")
    private String contactPhoneNumber;

    @NotNull(message = "Emergency level is required")
    private EmergencyLevel emergencyLevel;

    @NotNull(message = "Required before date and time is required")
    private LocalDateTime requiredBeforeDateTime;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reasonForBloodRequirement;
}
