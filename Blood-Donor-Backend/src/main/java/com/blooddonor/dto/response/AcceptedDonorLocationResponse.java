package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AcceptedDonorLocationResponse {

    private Long donorId;
    private String donorName;
    private String bloodGroup;
    private Double latitude;
    private Double longitude;
    private Long bloodRequestId;
    private LocalDateTime acceptedAt;
}
