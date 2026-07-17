package com.blooddonor.mapper;

import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.entity.BloodRequest;
import org.springframework.stereotype.Component;

@Component
public class BloodRequestMapper {

    public BloodRequestResponse toResponse(BloodRequest request) {
        return BloodRequestResponse.builder()
                .id(request.getId())
                .patientId(request.getPatient().getId())
                .donorId(request.getDonor().getId())
                .donorName(request.getDonor().getName())
                .patientName(request.getPatientName())
                .patientAge(request.getPatientAge())
                .patientGender(request.getPatientGender())
                .requiredBloodGroup(request.getRequiredBloodGroup())
                .requiredBloodGroupDisplay(request.getRequiredBloodGroup().getDisplayName())
                .unitsOfBloodRequired(request.getUnitsOfBloodRequired())
                .reasonForBloodRequirement(request.getReasonForBloodRequirement())
                .hospitalName(request.getHospitalName())
                .hospitalAddress(request.getHospitalAddress())
                .hospitalCity(request.getHospitalCity())
                .hospitalPinCode(request.getHospitalPinCode())
                .contactPersonName(request.getContactPersonName())
                .contactPhoneNumber(request.getContactPhoneNumber())
                .emergencyLevel(request.getEmergencyLevel())
                .requiredBeforeDateTime(request.getRequiredBeforeDateTime())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .respondedAt(request.getRespondedAt())
                .completedAt(request.getCompletedAt())
                .build();
    }
}
