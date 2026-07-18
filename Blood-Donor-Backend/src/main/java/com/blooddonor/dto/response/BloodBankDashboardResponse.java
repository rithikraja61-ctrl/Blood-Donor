package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

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

    /** Hospital → blood bank stock requests */
    private long hospitalRequestsTotal;
    private long hospitalRequestsPending;

    /** User/Hospital → donor blood requests (system-wide donor routing) */
    private long donorRequestsTotal;
    private long donorRequestsPending;

    private List<BloodTypeAvailabilityDto> availabilityByBloodType;
}
