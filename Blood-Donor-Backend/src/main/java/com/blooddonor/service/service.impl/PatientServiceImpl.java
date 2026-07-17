package com.blooddonor.service.impl;

import com.blooddonor.dto.request.PatientCreateRequest;
import com.blooddonor.dto.request.PatientUpdateRequest;
import com.blooddonor.dto.response.PatientResponse;
import com.blooddonor.entity.Hospital;
import com.blooddonor.entity.Patient;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.PatientMapper;
import com.blooddonor.repository.BloodRequestRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.PatientRepository;
import com.blooddonor.service.PatientService;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodRequestStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final PatientMapper patientMapper;
    private final SecurityUtil securityUtil;

    public PatientServiceImpl(
            PatientRepository patientRepository,
            HospitalRepository hospitalRepository,
            BloodRequestRepository bloodRequestRepository,
            PatientMapper patientMapper,
            SecurityUtil securityUtil) {
        this.patientRepository = patientRepository;
        this.hospitalRepository = hospitalRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.patientMapper = patientMapper;
        this.securityUtil = securityUtil;
    }

    @Override
    @Transactional
    public PatientResponse createPatient(PatientCreateRequest request) {
        Hospital hospital = findCurrentHospital();
        Patient patient = patientMapper.toEntity(request);
        patient.setHospital(hospital);
        Patient saved = patientRepository.save(patient);
        return patientMapper.toResponse(saved, null);
    }

    @Override
    public List<PatientResponse> listPatientsForHospital() {
        Hospital hospital = findCurrentHospital();
        return patientRepository.findByHospitalIdOrderByCreatedAtDesc(hospital.getId()).stream()
                .map(patient -> patientMapper.toResponse(
                        patient, resolveLatestRequestStatus(patient.getId())))
                .toList();
    }

    @Override
    public PatientResponse getPatientById(Long patientId) {
        Hospital hospital = findCurrentHospital();
        Patient patient = findPatientForHospital(patientId, hospital.getId());
        return patientMapper.toResponse(patient, resolveLatestRequestStatus(patient.getId()));
    }

    @Override
    @Transactional
    public PatientResponse updatePatient(Long patientId, PatientUpdateRequest request) {
        Hospital hospital = findCurrentHospital();
        Patient patient = findPatientForHospital(patientId, hospital.getId());
        patientMapper.updateEntity(patient, request);
        Patient updated = patientRepository.save(patient);
        return patientMapper.toResponse(
                updated, resolveLatestRequestStatus(updated.getId()));
    }

    @Override
    @Transactional
    public void deletePatient(Long patientId) {
        Hospital hospital = findCurrentHospital();
        Patient patient = findPatientForHospital(patientId, hospital.getId());

        if (bloodRequestRepository.existsByPatientIdAndStatus(patientId, BloodRequestStatus.PENDING)) {
            throw new BadRequestException("Cannot delete patient with a pending blood request");
        }

        patientRepository.delete(patient);
    }

    private BloodRequestStatus resolveLatestRequestStatus(Long patientId) {
        return bloodRequestRepository.findTopByPatientIdOrderByCreatedAtDesc(patientId)
                .map(br -> br.getStatus())
                .orElse(null);
    }

    private Patient findPatientForHospital(Long patientId, Long hospitalId) {
        return patientRepository.findByIdAndHospitalId(patientId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }

    private Hospital findCurrentHospital() {
        Long hospitalId = securityUtil.getCurrentUserId();
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }
}
