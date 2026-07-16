package com.blooddonor.service;

import com.blooddonor.dto.request.UserUpdateRequest;
import com.blooddonor.dto.response.UserResponse;

public interface UserService {

    UserResponse getProfile();

    UserResponse updateProfile(UserUpdateRequest request);

    void deleteAccount();
}
