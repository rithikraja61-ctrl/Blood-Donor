package com.blooddonor.dto.response;

import com.blooddonor.validation.BloodRequestStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class BloodRequestGroupSummaryResponse {

    private String requestGroupId;
    private int totalSent;
    private int acceptedCount;
    private int pendingCount;
    private int rejectedCount;
    private int expiredCount;
    private BloodRequestStatus groupStatus;
    private Double requestLatitude;
    private Double requestLongitude;
    private LocalDateTime createdAt;
    private List<AcceptedDonorLocationResponse> acceptedDonors;
}
