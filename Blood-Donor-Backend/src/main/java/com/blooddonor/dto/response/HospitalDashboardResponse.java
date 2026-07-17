package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HospitalDashboardResponse {

    private long totalPatientsWaitingForBlood;
    private long totalPatientsSuccessfullyReceivedBlood;
    private long totalActiveDonorsWhoAcceptedRequests;
}
