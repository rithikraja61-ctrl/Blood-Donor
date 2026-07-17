package com.blooddonor.dto.response;

import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.Gender;
import com.blooddonor.validation.TreatmentStatus;
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
    private String hospitalName;
    private BloodRequestStatus requestStatus;
    private boolean donorAssigned;
    private TreatmentStatus treatmentStatus;
}
