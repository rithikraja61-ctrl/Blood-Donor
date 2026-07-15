package com.blooddonor.service;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.dto.response.DonorSearchResponse;

import java.util.List;

public interface DonorService {

    DonorResponse getProfile();

    DonorResponse updateProfile(DonorUpdateRequest request);

    void deleteAccount();

    List<DonorSearchResponse> searchDonors(String bloodGroup, String pinCode);
}
