package com.blooddonor.service.impl;

import com.blooddonor.dto.request.HospitalUpdateRequest;
import com.blooddonor.dto.response.HospitalResponse;
import com.blooddonor.entity.Hospital;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.HospitalMapper;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.service.HospitalService;
import com.blooddonor.util.SecurityUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalMapper hospitalMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    public HospitalServiceImpl(
            HospitalRepository hospitalRepository,
            HospitalMapper hospitalMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder) {
        this.hospitalRepository = hospitalRepository;
        this.hospitalMapper = hospitalMapper;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public HospitalResponse getProfile() {
        Hospital hospital = findCurrentHospital();
        return hospitalMapper.toResponse(hospital);
    }

    @Override
    public HospitalResponse updateProfile(HospitalUpdateRequest request) {
        Hospital hospital = findCurrentHospital();
        hospitalMapper.updateEntity(hospital, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            hospital.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Hospital updatedHospital = hospitalRepository.save(hospital);
        return hospitalMapper.toResponse(updatedHospital);
    }

    @Override
    public void deleteAccount() {
        Hospital hospital = findCurrentHospital();
        hospitalRepository.delete(hospital);
    }

    private Hospital findCurrentHospital() {
        Long hospitalId = securityUtil.getCurrentUserId();
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }
}