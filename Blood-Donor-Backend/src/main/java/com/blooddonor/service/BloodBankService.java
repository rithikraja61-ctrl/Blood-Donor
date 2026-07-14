package com.blooddonor.service;

import com.blooddonor.dto.request.BloodBankUpdateRequest;
import com.blooddonor.dto.response.BloodBankResponse;

public interface BloodBankService {

    BloodBankResponse getProfile();

    BloodBankResponse updateProfile(BloodBankUpdateRequest request);

    void deleteAccount();
}