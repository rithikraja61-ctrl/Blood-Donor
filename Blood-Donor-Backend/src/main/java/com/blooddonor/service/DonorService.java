package com.blooddonor.service;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.dto.response.PagedDonorSearchResponse;
import org.springframework.data.domain.Pageable;

public interface DonorService {

    DonorResponse getProfile();

    DonorResponse updateProfile(DonorUpdateRequest request);

    void deleteAccount();

    PagedDonorSearchResponse searchDonors(String bloodGroup, String pinCode, Pageable pageable);
}
