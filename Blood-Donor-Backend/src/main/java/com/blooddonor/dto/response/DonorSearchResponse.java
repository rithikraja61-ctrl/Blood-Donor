package com.blooddonor.dto.response;

import com.blooddonor.validation.DistancePriority;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class DonorSearchResponse {
    private String name;
    private String bloodGroup;          // "B+"
    private String city;
    private String pinCode;
    private DistancePriority distancePriority;
    private String phoneNumber;
    private LocalDate lastDonationDate;
    private boolean availabilityStatus;
}