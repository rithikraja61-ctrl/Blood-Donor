package com.blooddonor.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BloodInventoryUpdateRequest {

    @NotNull(message = "Blood group is required")
    private String bloodGroup;

    @Min(value = 0, message = "Available units cannot be negative")
    private int availableUnits;

    @Min(value = 0, message = "Reserved units cannot be negative")
    private int reservedUnits;

    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;
}
