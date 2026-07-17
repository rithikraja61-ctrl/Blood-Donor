package com.blooddonor.dto.response;

import com.blooddonor.validation.BloodType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssignedDonorResponse {

    private Long donorId;
    private String donorName;
    private String email;
    private String phoneNumber;
    private BloodType bloodType;
    private String bloodGroup;
    private String city;
    private String pincode;
    private Long bloodRequestId;
    private String bloodRequestStatus;
}
