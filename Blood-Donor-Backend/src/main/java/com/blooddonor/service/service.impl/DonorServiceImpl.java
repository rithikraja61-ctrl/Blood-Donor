package com.blooddonor.service.impl;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.entity.Donor;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.DonorMapper;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.service.DonorService;
import com.blooddonor.util.SecurityUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DonorServiceImpl implements DonorService {

    private final DonorRepository donorRepository;
    private final DonorMapper donorMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    public DonorServiceImpl(
            DonorRepository donorRepository,
            DonorMapper donorMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder) {
        this.donorRepository = donorRepository;
        this.donorMapper = donorMapper;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public DonorResponse getProfile() {
        Donor donor = findCurrentDonor();
        return donorMapper.toResponse(donor);
    }

    @Override
    public DonorResponse updateProfile(DonorUpdateRequest request) {
        Donor donor = findCurrentDonor();
        donorMapper.updateEntity(donor, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            donor.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Donor updatedDonor = donorRepository.save(donor);
        return donorMapper.toResponse(updatedDonor);
    }

    @Override
    public void deleteAccount() {
        Donor donor = findCurrentDonor();
        donorRepository.delete(donor);
    }

    private Donor findCurrentDonor() {
        Long donorId = securityUtil.getCurrentUserId();
        return donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
    }
}