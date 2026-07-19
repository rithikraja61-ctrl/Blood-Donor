package com.blooddonor.dto.request;

import com.blooddonor.validation.EmergencyLevel;
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
public class UserBloodBankRequestDto {

    @NotNull(message = "Blood bank id is required")
    private Long bloodBankId;

    @NotNull(message = "Emergency level is required")
    private EmergencyLevel emergencyLevel;

    @NotNull(message = "Required before date is required")
    @Future(message = "Required before date must be in the future")
    private LocalDateTime requiredBefore;

    @NotBlank(message = "Contact person name is required")
    private String contactPersonName;

    @NotBlank(message = "Contact phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact phone must be 10 to 15 digits")
    private String contactPhoneNumber;

    @Min(value = 1, message = "Required units must be at least 1")
    private int requiredUnits = 1;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
}
