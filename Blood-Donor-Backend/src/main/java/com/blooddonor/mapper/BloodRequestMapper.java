package com.blooddonor.mapper;

import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.entity.BloodRequest;
import com.blooddonor.entity.Donor;
import com.blooddonor.util.GeoDistanceUtil;
import org.springframework.stereotype.Component;

@Component
public class BloodRequestMapper {

    public BloodRequestResponse toResponse(BloodRequest request) {
        return toResponse(request, null);
    }

    public BloodRequestResponse toResponse(BloodRequest request, Donor viewerDonor) {
        Double distanceKm = computeDistanceKm(request, viewerDonor);

        return BloodRequestResponse.builder()
                .id(request.getId())
                .requestGroupId(request.getRequestGroupId())
                .requesterType(request.getRequesterType())
                .requesterName(request.getHospitalName())
                .requesterAddress(request.getHospitalAddress())
                .requesterCity(request.getHospitalCity())
                .requesterPinCode(request.getHospitalPinCode())
                .patientId(request.getPatient() != null ? request.getPatient().getId() : null)
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
                .requestSentDateTime(request.getCreatedAt())
                .responseDateTime(request.getRespondedAt())
                .requestLatitude(request.getRequestLatitude())
                .requestLongitude(request.getRequestLongitude())
                .distanceKm(distanceKm)
                .build();
    }

    private Double computeDistanceKm(BloodRequest request, Donor viewerDonor) {
        if (viewerDonor == null
                || request.getRequestLatitude() == null
                || request.getRequestLongitude() == null
                || viewerDonor.getLatitude() == null
                || viewerDonor.getLongitude() == null) {
            return null;
        }

        return roundDistance(GeoDistanceUtil.haversineKm(
                viewerDonor.getLatitude(),
                viewerDonor.getLongitude(),
                request.getRequestLatitude(),
                request.getRequestLongitude()));
    }

    private double roundDistance(double distanceKm) {
        return Math.round(distanceKm * 10.0) / 10.0;
    }
}
