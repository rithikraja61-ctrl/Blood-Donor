package com.blooddonor.service.impl;

import com.blooddonor.dto.request.BloodBankUpdateRequest;
import com.blooddonor.dto.response.BloodBankResponse;
import com.blooddonor.dto.response.BloodBankSummaryResponse;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.exception.BloodBankNotFoundException;
import com.blooddonor.mapper.BloodBankMapper;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.service.BloodBankService;
import com.blooddonor.util.SecurityUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class BloodBankServiceImpl implements BloodBankService {

    private final BloodBankRepository bloodBankRepository;
    private final BloodBankMapper bloodBankMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    public BloodBankServiceImpl(
            BloodBankRepository bloodBankRepository,
            BloodBankMapper bloodBankMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder) {
        this.bloodBankRepository = bloodBankRepository;
        this.bloodBankMapper = bloodBankMapper;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public BloodBankResponse getProfile() {
        BloodBank bloodBank = findCurrentBloodBank();
        return bloodBankMapper.toResponse(bloodBank);
    }

    @Override
    public BloodBankResponse updateProfile(BloodBankUpdateRequest request) {
        BloodBank bloodBank = findCurrentBloodBank();
        bloodBankMapper.updateEntity(bloodBank, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            bloodBank.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        BloodBank updatedBloodBank = bloodBankRepository.save(bloodBank);
        return bloodBankMapper.toResponse(updatedBloodBank);
    }

    @Override
    public void deleteAccount() {
        BloodBank bloodBank = findCurrentBloodBank();
        bloodBankRepository.delete(bloodBank);
    }

    @Override
    public List<BloodBankSummaryResponse> listBloodBanksForHospital() {
        return bloodBankRepository.findAll().stream()
                .sorted(Comparator.comparing(BloodBank::getName, String.CASE_INSENSITIVE_ORDER))
                .map(bloodBank -> BloodBankSummaryResponse.builder()
                        .id(bloodBank.getId())
                        .name(bloodBank.getName())
                        .city(bloodBank.getCity())
                        .pinCode(bloodBank.getPincode())
                        .build())
                .toList();
    }

    private BloodBank findCurrentBloodBank() {
        Long bloodBankId = securityUtil.getCurrentUserId();
        return bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));
    }
}