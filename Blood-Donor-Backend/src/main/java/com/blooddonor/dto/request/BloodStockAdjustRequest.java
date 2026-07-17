package com.blooddonor.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BloodStockAdjustRequest {

    @NotNull(message = "Blood group is required")
    private String bloodGroup;

    @Min(value = 1, message = "Units must be at least 1")
    private int units;

    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;
}
