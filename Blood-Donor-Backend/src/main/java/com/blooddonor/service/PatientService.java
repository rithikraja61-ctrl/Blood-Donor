package com.blooddonor.service;

import com.blooddonor.dto.request.PatientCreateRequest;
import com.blooddonor.dto.request.PatientTreatmentStatusUpdateRequest;
import com.blooddonor.dto.request.PatientUpdateRequest;
import com.blooddonor.dto.response.PatientResponse;

import java.util.List;

public interface PatientService {

    PatientResponse createPatient(PatientCreateRequest request);

    List<PatientResponse> listPatientsForHospital();

    PatientResponse updatePatient(Long patientId, PatientUpdateRequest request);

    PatientResponse updateTreatmentStatus(Long patientId, PatientTreatmentStatusUpdateRequest request);
}
