package com.blooddonor.dto.request;

import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.EmergencyLevel;
import com.blooddonor.validation.Gender;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SendBloodRequestDto {

    @NotNull(message = "Patient id is required")
    private Long patientId;

    /**
     * Donor id chosen from donor search results (not typed manually by the hospital in the UI).
     */
    @NotNull(message = "Selected donor id is required")
    private Long selectedDonorId;

    private String patientName;

    @Min(value = 0, message = "Age must be zero or greater")
    private Integer patientAge;

    private Gender patientGender;

    private BloodType requiredBloodGroup;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reasonForBloodRequirement;

    @NotNull(message = "Emergency level is required")
    private EmergencyLevel emergencyLevel;

    @NotNull(message = "Required before date and time is required")
    private LocalDateTime requiredBeforeDateTime;
}
