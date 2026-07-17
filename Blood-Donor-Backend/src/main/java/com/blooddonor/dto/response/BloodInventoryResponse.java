package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class BloodInventoryResponse {

    private String bloodGroup;
    private int availableUnits;
    private int reservedUnits;
    private int issuedUnits;
    private LocalDate expiryDate;
    private LocalDateTime lastUpdated;
}
