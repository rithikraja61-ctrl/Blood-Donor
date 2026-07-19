package com.blooddonor.service;

import com.blooddonor.dto.request.UserUpdateRequest;
import com.blooddonor.dto.request.LiveLocationRequest;
import com.blooddonor.dto.response.BloodBankSummaryResponse;
import com.blooddonor.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getProfile();

    UserResponse updateProfile(UserUpdateRequest request);

    UserResponse updateLiveLocation(LiveLocationRequest request);

    void deleteAccount();

    List<BloodBankSummaryResponse> listAvailableBloodBanks();
}
