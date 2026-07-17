package com.blooddonor.service;

import com.blooddonor.dto.response.BloodIssueResponse;

import java.util.List;

public interface BloodBankIssueService {

    List<BloodIssueResponse> getIssueHistory();
}
