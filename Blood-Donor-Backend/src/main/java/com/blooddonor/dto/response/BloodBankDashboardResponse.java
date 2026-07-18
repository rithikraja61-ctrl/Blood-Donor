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

    /** User/Hospital → donor blood requests visible to blood bank */
    private long receivedRoutingRequestsTotal;
    private long receivedRoutingRequestsPending;

    /** Blood bank → donor requests sent by this blood bank */
    private long sentDonorRequestsTotal;
    private long sentDonorRequestsPending;

    private List<BloodTypeAvailabilityDto> availabilityByBloodType;
}
