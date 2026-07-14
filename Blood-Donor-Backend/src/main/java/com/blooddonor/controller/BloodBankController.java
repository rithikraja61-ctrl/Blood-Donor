package com.blooddonor.controller;

import com.blooddonor.dto.request.BloodBankUpdateRequest;
import com.blooddonor.dto.response.BloodBankResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.BloodBankService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bloodbanks")
public class BloodBankController {

    private final BloodBankService bloodBankService;

    public BloodBankController(BloodBankService bloodBankService) {
        this.bloodBankService = bloodBankService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<BloodBankResponse>> getProfile() {
        BloodBankResponse response = bloodBankService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<BloodBankResponse>> updateProfile(
            @Valid @RequestBody BloodBankUpdateRequest request) {
        BloodBankResponse response = bloodBankService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        bloodBankService.deleteAccount();
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }
}