package com.blooddonor.service.impl;

import com.blooddonor.dto.request.HospitalUpdateRequest;
import com.blooddonor.dto.response.HospitalDashboardResponse;
import com.blooddonor.dto.response.HospitalResponse;
import com.blooddonor.entity.Hospital;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.HospitalMapper;
import com.blooddonor.repository.BloodRequestRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.PatientRepository;
import com.blooddonor.service.HospitalService;
import com.blooddonor.service.AccountLocationService;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.PatientRequestStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final HospitalMapper hospitalMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;
    private final AccountLocationService accountLocationService;

    public HospitalServiceImpl(
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            BloodRequestRepository bloodRequestRepository,
            HospitalMapper hospitalMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder,
            AccountLocationService accountLocationService) {
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.hospitalMapper = hospitalMapper;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
        this.accountLocationService = accountLocationService;
    }

    @Override
    public HospitalResponse getProfile() {
        return hospitalMapper.toResponse(findCurrentHospital());
    }

    @Override
    public HospitalResponse updateProfile(HospitalUpdateRequest request) {
        Hospital hospital = findCurrentHospital();
        hospitalMapper.updateEntity(hospital, request);

        accountLocationService.applyLocation(
                hospital,
                request.getLatitude(),
                request.getLongitude(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getState(),
                hospital.getPincode());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            hospital.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return hospitalMapper.toResponse(hospitalRepository.save(hospital));
    }

    @Override
    public void deleteAccount() {
        hospitalRepository.delete(findCurrentHospital());
    }

    @Override
    public HospitalDashboardResponse getDashboard() {
        Long hospitalId = findCurrentHospital().getId();

        return HospitalDashboardResponse.builder()
                .totalPatientsWaitingForBlood(patientRepository.countPatientsWaitingForBlood(hospitalId))
                .totalPatientsSuccessfullyReceivedBlood(patientRepository.countPatientsSuccessfullyReceivedBlood(
                        hospitalId, PatientRequestStatus.DONOR_RECEIVED))
                .totalActiveDonorsWhoAcceptedRequests(bloodRequestRepository.countDistinctDonorsWithAcceptedRequests(
                        hospitalId, BloodRequestStatus.ACCEPTED))
                .build();
    }

    private Hospital findCurrentHospital() {
        Long hospitalId = securityUtil.getCurrentUserId();
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }
}
