package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BloodBankDashboardResponse {

    private long totalBloodUnitsAvailable;
    private long totalBloodRequestsReceived;
    private long totalBloodRequestsApproved;
    private long totalBloodRequestsRejected;
    private long totalBloodUnitsIssued;
    private long totalPendingRequests;
    private long totalExpiredBloodUnits;
    private long todaysRequests;
    private long monthlyBloodIssued;
}
