package com.blooddonor.dto.response;

import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.Gender;
import com.blooddonor.validation.PatientRequestStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class PatientResponse {

    private Long id;
    private String patientName;
    private int age;
    private Gender gender;
    private BloodType bloodType;
    private String bloodGroup;
    private int unitsRequired;
    private String reasonForBlood;
    private LocalDate requiredBeforeDate;
    private boolean donorAssigned;
    private Long assignedDonorId;
    private PatientRequestStatus patientRequestStatus;
    private BloodRequestStatus latestBloodRequestStatus;
}
