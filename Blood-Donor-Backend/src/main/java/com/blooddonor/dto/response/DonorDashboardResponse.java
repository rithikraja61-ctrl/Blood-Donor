package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class DonorDashboardResponse {

    private String donorName;
    private String bloodGroupDisplay;
    private LocalDate lastDonationDate;
    private long totalDonationsMade;
    private long pendingRequestsCount;
}
