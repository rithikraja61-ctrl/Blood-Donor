package com.blooddonor.service;

import com.blooddonor.dto.request.BloodBankSignupRequest;
import com.blooddonor.dto.request.DonorSignupRequest;
import com.blooddonor.dto.request.HospitalSignupRequest;
import com.blooddonor.dto.request.LoginRequest;
import com.blooddonor.dto.request.UserSignupRequest;
import com.blooddonor.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse registerUser(UserSignupRequest request);

    AuthResponse registerDonor(DonorSignupRequest request);

    AuthResponse registerHospital(HospitalSignupRequest request);

    AuthResponse registerBloodBank(BloodBankSignupRequest request);

    AuthResponse login(LoginRequest request);
}