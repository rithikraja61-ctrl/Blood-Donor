package com.blooddonor.service;

import com.blooddonor.dto.request.HospitalUpdateRequest;
import com.blooddonor.dto.response.BloodBankSummaryResponse;
import com.blooddonor.dto.response.HospitalDashboardResponse;
import com.blooddonor.dto.response.HospitalResponse;

import java.util.List;

public interface HospitalService {

    HospitalResponse getProfile();

    HospitalResponse updateProfile(HospitalUpdateRequest request);

    void deleteAccount();

    HospitalDashboardResponse getDashboard();

    List<BloodBankSummaryResponse> listAvailableBloodBanks();
}
