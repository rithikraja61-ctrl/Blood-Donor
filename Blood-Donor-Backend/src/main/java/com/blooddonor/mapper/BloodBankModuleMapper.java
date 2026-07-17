package com.blooddonor.mapper;

import com.blooddonor.dto.response.BloodInventoryResponse;
import com.blooddonor.dto.response.BloodIssueResponse;
import com.blooddonor.dto.response.HospitalRequestResponse;
import com.blooddonor.entity.BloodInventory;
import com.blooddonor.entity.BloodIssue;
import com.blooddonor.entity.HospitalRequest;
import org.springframework.stereotype.Component;

@Component
public class BloodBankModuleMapper {

    public BloodInventoryResponse toInventoryResponse(BloodInventory inventory) {
        return BloodInventoryResponse.builder()
                .bloodGroup(inventory.getBloodGroup().getDisplayName())
                .availableUnits(inventory.getAvailableUnits())
                .reservedUnits(inventory.getReservedUnits())
                .issuedUnits(inventory.getIssuedUnits())
                .expiryDate(inventory.getExpiryDate())
                .lastUpdated(inventory.getLastUpdated())
                .build();
    }

    public HospitalRequestResponse toHospitalRequestResponse(HospitalRequest request) {
        return HospitalRequestResponse.builder()
                .requestId(request.getId())
                .hospitalName(request.getHospitalName())
                .patientName(request.getPatientName())
                .patientAge(request.getPatientAge())
                .gender(request.getGender().name())
                .bloodGroup(request.getBloodGroup().getDisplayName())
                .requiredUnits(request.getRequiredUnits())
                .emergencyLevel(request.getEmergencyLevel().name())
                .reason(request.getReason())
                .requiredBefore(request.getRequiredBefore())
                .hospitalContact(request.getHospitalContact())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .processedAt(request.getProcessedAt())
                .build();
    }

    public BloodIssueResponse toBloodIssueResponse(BloodIssue issue) {
        return BloodIssueResponse.builder()
                .issueId(issue.getId())
                .hospitalName(issue.getHospitalName())
                .patientName(issue.getPatientName())
                .bloodGroup(issue.getBloodGroup().getDisplayName())
                .units(issue.getUnits())
                .issueDate(issue.getIssueDate())
                .issuedBy(issue.getIssuedBy())
                .status(issue.getStatus().name())
                .build();
    }
}
