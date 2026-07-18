package com.blooddonor.service;

import com.blooddonor.dto.request.BloodBankUpdateRequest;
import com.blooddonor.dto.response.BloodBankResponse;
import com.blooddonor.dto.response.BloodBankSummaryResponse;

import java.util.List;

public interface BloodBankService {

    BloodBankResponse getProfile();

    BloodBankResponse updateProfile(BloodBankUpdateRequest request);

    void deleteAccount();

    List<BloodBankSummaryResponse> listBloodBanksForHospital();
}