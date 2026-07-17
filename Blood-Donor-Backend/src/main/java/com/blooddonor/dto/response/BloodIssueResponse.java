package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BloodIssueResponse {

    private Long issueId;
    private String hospitalName;
    private String patientName;
    private String bloodGroup;
    private int units;
    private LocalDateTime issueDate;
    private String issuedBy;
    private String status;
}
