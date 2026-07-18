package com.blooddonor.service;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.CursorDonorSearchResponse;
import com.blooddonor.dto.request.LiveLocationRequest;
import com.blooddonor.dto.response.DonorDashboardResponse;
import com.blooddonor.dto.response.DonorResponse;

public interface DonorService {

    DonorResponse getProfile();

    DonorDashboardResponse getDashboard();

    DonorResponse updateProfile(DonorUpdateRequest request);

    DonorResponse updateLiveLocation(LiveLocationRequest request);

    void deleteAccount();

    CursorDonorSearchResponse searchDonors(
            String bloodGroup,
            String pinCode,
            Double latitude,
            Double longitude,
            Double radiusKm,
            int limit,
            String nextCursor,
            String previousCursor);
}
