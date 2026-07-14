package com.blooddonor.controller;

import com.blooddonor.dto.request.BloodBankSignupRequest;
import com.blooddonor.dto.request.DonorSignupRequest;
import com.blooddonor.dto.request.HospitalSignupRequest;
import com.blooddonor.dto.request.LoginRequest;
import com.blooddonor.dto.request.UserSignupRequest;
import com.blooddonor.dto.response.AuthResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/user/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(
            @Valid @RequestBody UserSignupRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/donor/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> registerDonor(
            @Valid @RequestBody DonorSignupRequest request) {
        AuthResponse response = authService.registerDonor(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Donor registered successfully", response));
    }

    @PostMapping("/hospital/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> registerHospital(
            @Valid @RequestBody HospitalSignupRequest request) {
        AuthResponse response = authService.registerHospital(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hospital registered successfully", response));
    }

    @PostMapping("/bloodbank/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> registerBloodBank(
            @Valid @RequestBody BloodBankSignupRequest request) {
        AuthResponse response = authService.registerBloodBank(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blood bank registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}