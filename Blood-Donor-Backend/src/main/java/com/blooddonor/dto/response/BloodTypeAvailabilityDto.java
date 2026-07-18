package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BloodTypeAvailabilityDto {

    private String bloodGroup;
    private int availableUnits;
}
