package com.blooddonor.mapper;

import com.blooddonor.dto.request.PatientCreateRequest;
import com.blooddonor.dto.request.PatientUpdateRequest;
import com.blooddonor.dto.response.PatientResponse;
import com.blooddonor.entity.Patient;
import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.PatientRequestStatus;
import com.blooddonor.validation.TreatmentStatus;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PatientMapper {

    public Patient toEntity(PatientCreateRequest request) {
        Patient patient = new Patient();
        patient.setPatientName(request.getPatientName());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setBloodType(request.getBloodType());
        patient.setUnitsRequired(request.getUnitsRequired());
        patient.setReasonForBlood(request.getReasonForBlood());
        patient.setRequiredBeforeDate(request.getRequiredBeforeDate());
        patient.setTreatmentStatus(TreatmentStatus.WAITING);
        patient.setDonorAssigned(false);
        patient.setPatientRequestStatus(PatientRequestStatus.WAITING);
        return patient;
    }

    public PatientResponse toResponse(Patient patient, BloodRequestStatus latestBloodRequestStatus) {
        return PatientResponse.builder()
                .id(patient.getId())
                .patientName(patient.getPatientName())
                .age(patient.getAge())
                .gender(patient.getGender())
                .bloodType(patient.getBloodType())
                .bloodGroup(patient.getBloodType().getDisplayName())
                .reasonForBlood(patient.getReasonForBlood())
                .requiredBeforeDate(patient.getRequiredBeforeDate())
                .donorAssigned(patient.isDonorAssigned())
                .assignedDonorId(patient.getAssignedDonor() != null ? patient.getAssignedDonor().getId() : null)
                .patientRequestStatus(patient.getPatientRequestStatus())
                .latestBloodRequestStatus(latestBloodRequestStatus)
                .build();
    }

    public void updateEntity(Patient patient, PatientUpdateRequest request) {
        Optional.ofNullable(request.getPatientName()).ifPresent(patient::setPatientName);
        Optional.ofNullable(request.getAge()).ifPresent(patient::setAge);
        Optional.ofNullable(request.getGender()).ifPresent(patient::setGender);
        Optional.ofNullable(request.getBloodType()).ifPresent(patient::setBloodType);
        Optional.ofNullable(request.getUnitsRequired()).ifPresent(patient::setUnitsRequired);
        Optional.ofNullable(request.getReasonForBlood()).ifPresent(patient::setReasonForBlood);
        Optional.ofNullable(request.getRequiredBeforeDate()).ifPresent(patient::setRequiredBeforeDate);
    }
}
