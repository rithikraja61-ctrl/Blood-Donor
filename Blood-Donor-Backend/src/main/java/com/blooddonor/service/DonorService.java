package com.blooddonor.service;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.CursorDonorSearchResponse;
import com.blooddonor.dto.response.DonorResponse;

public interface DonorService {

    DonorResponse getProfile();

    DonorResponse updateProfile(DonorUpdateRequest request);

    void deleteAccount();

    CursorDonorSearchResponse searchDonors(
            String bloodGroup,
            String pinCode,
            int limit,
            String nextCursor,
            String previousCursor);
}
