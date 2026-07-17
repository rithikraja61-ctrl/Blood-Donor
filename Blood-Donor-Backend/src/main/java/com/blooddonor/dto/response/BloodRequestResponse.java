package com.blooddonor.dto.response;

import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.EmergencyLevel;
import com.blooddonor.validation.Gender;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BloodRequestResponse {

    private Long id;
    private Long patientId;
    private Long donorId;
    private String donorName;
    private String patientName;
    private int patientAge;
    private Gender patientGender;
    private BloodType requiredBloodGroup;
    private String requiredBloodGroupDisplay;
    private int unitsOfBloodRequired;
    private String reasonForBloodRequirement;
    private String hospitalName;
    private String hospitalAddress;
    private String hospitalCity;
    private String hospitalPinCode;
    private String contactPersonName;
    private String contactPhoneNumber;
    private EmergencyLevel emergencyLevel;
    private LocalDateTime requiredBeforeDateTime;
    private BloodRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private LocalDateTime completedAt;
}
