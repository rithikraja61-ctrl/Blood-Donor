package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class HospitalRequestResponse {

    private Long requestId;
    private String hospitalName;
    private String patientName;
    private int patientAge;
    private String gender;
    private String bloodGroup;
    private int requiredUnits;
    private String emergencyLevel;
    private String reason;
    private LocalDateTime requiredBefore;
    private String hospitalContact;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
