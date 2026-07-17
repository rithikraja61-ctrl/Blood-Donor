package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HospitalDashboardResponse {

    private long totalBloodRequests;
    private long totalPatientsWaitingForBlood;
    private long totalPatientsSuccessfullyReceivedBlood;
    private long totalPatientsStillWaitingForDonors;
    private long totalBloodDonationsCompletedToday;
    private long totalActiveDonorsWhoAcceptedRequests;
}
