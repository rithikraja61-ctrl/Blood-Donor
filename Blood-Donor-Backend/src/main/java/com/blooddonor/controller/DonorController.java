package com.blooddonor.controller;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.dto.response.DonorDashboardResponse;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.BloodRequestService;
import com.blooddonor.service.DonorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/donors")
public class DonorController {

    private final DonorService donorService;
    private final BloodRequestService bloodRequestService;

    public DonorController(DonorService donorService, BloodRequestService bloodRequestService) {
        this.donorService = donorService;
        this.bloodRequestService = bloodRequestService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<DonorResponse>> getProfile() {
        DonorResponse response = donorService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DonorDashboardResponse>> getDashboard() {
        DonorDashboardResponse response = donorService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard fetched successfully", response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<DonorResponse>> updateProfile(
            @Valid @RequestBody DonorUpdateRequest request) {
        DonorResponse response = donorService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        donorService.deleteAccount();
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    @GetMapping("/blood-requests")
    public ResponseEntity<ApiResponse<List<BloodRequestResponse>>> listIncomingBloodRequests() {
        List<BloodRequestResponse> response = bloodRequestService.listIncomingForDonor();
        return ResponseEntity.ok(ApiResponse.success("Incoming blood requests fetched successfully", response));
    }

    @PostMapping("/blood-requests/{requestId}/accept")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> acceptBloodRequest(
            @PathVariable Long requestId) {
        BloodRequestResponse response = bloodRequestService.acceptRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Blood request accepted successfully", response));
    }

    @PostMapping("/blood-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> rejectBloodRequest(
            @PathVariable Long requestId) {
        BloodRequestResponse response = bloodRequestService.rejectRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Blood request rejected successfully", response));
    }
}

