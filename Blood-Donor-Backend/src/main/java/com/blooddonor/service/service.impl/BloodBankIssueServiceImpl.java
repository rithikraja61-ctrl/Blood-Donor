package com.blooddonor.service.impl;

import com.blooddonor.dto.response.BloodIssueResponse;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.exception.BloodBankNotFoundException;
import com.blooddonor.mapper.BloodBankModuleMapper;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.BloodIssueRepository;
import com.blooddonor.service.BloodBankIssueService;
import com.blooddonor.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BloodBankIssueServiceImpl implements BloodBankIssueService {

    private final BloodBankRepository bloodBankRepository;
    private final BloodIssueRepository bloodIssueRepository;
    private final BloodBankModuleMapper bloodBankModuleMapper;
    private final SecurityUtil securityUtil;

    public BloodBankIssueServiceImpl(
            BloodBankRepository bloodBankRepository,
            BloodIssueRepository bloodIssueRepository,
            BloodBankModuleMapper bloodBankModuleMapper,
            SecurityUtil securityUtil) {
        this.bloodBankRepository = bloodBankRepository;
        this.bloodIssueRepository = bloodIssueRepository;
        this.bloodBankModuleMapper = bloodBankModuleMapper;
        this.securityUtil = securityUtil;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BloodIssueResponse> getIssueHistory() {
        BloodBank bloodBank = findCurrentBloodBank();
        return bloodIssueRepository.findByBloodBankIdOrderByIssueDateDesc(bloodBank.getId())
                .stream()
                .map(bloodBankModuleMapper::toBloodIssueResponse)
                .toList();
    }

    private BloodBank findCurrentBloodBank() {
        Long bloodBankId = securityUtil.getCurrentUserId();
        return bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));
    }
}
