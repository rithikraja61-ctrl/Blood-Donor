package com.blooddonor.controller;

import com.blooddonor.dto.request.BloodBankUpdateRequest;
import com.blooddonor.dto.request.BloodInventoryUpdateRequest;
import com.blooddonor.dto.request.BloodStockAdjustRequest;
import com.blooddonor.dto.response.BloodBankDashboardResponse;
import com.blooddonor.dto.response.BloodBankResponse;
import com.blooddonor.dto.response.BloodInventoryResponse;
import com.blooddonor.dto.response.BloodIssueResponse;
import com.blooddonor.dto.response.HospitalRequestResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.BloodBankDashboardService;
import com.blooddonor.service.BloodBankHospitalRequestService;
import com.blooddonor.service.BloodBankInventoryService;
import com.blooddonor.service.BloodBankIssueService;
import com.blooddonor.service.BloodBankService;
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
@RequestMapping("/bloodbanks")
public class BloodBankController {

    private final BloodBankService bloodBankService;
    private final BloodBankDashboardService bloodBankDashboardService;
    private final BloodBankInventoryService bloodBankInventoryService;
    private final BloodBankHospitalRequestService bloodBankHospitalRequestService;
    private final BloodBankIssueService bloodBankIssueService;

    public BloodBankController(
            BloodBankService bloodBankService,
            BloodBankDashboardService bloodBankDashboardService,
            BloodBankInventoryService bloodBankInventoryService,
            BloodBankHospitalRequestService bloodBankHospitalRequestService,
            BloodBankIssueService bloodBankIssueService) {
        this.bloodBankService = bloodBankService;
        this.bloodBankDashboardService = bloodBankDashboardService;
        this.bloodBankInventoryService = bloodBankInventoryService;
        this.bloodBankHospitalRequestService = bloodBankHospitalRequestService;
        this.bloodBankIssueService = bloodBankIssueService;
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

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<BloodBankDashboardResponse>> getDashboard() {
        BloodBankDashboardResponse response = bloodBankDashboardService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard fetched successfully", response));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<BloodInventoryResponse>>> getInventory() {
        List<BloodInventoryResponse> response = bloodBankInventoryService.getInventory();
        return ResponseEntity.ok(ApiResponse.success("Inventory fetched successfully", response));
    }

    @PutMapping("/inventory")
    public ResponseEntity<ApiResponse<BloodInventoryResponse>> updateInventory(
            @Valid @RequestBody BloodInventoryUpdateRequest request) {
        BloodInventoryResponse response = bloodBankInventoryService.updateInventory(request);
        return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", response));
    }

    @PostMapping("/inventory/increase")
    public ResponseEntity<ApiResponse<BloodInventoryResponse>> increaseStock(
            @Valid @RequestBody BloodStockAdjustRequest request) {
        BloodInventoryResponse response = bloodBankInventoryService.increaseStock(request);
        return ResponseEntity.ok(ApiResponse.success("Stock increased successfully", response));
    }

    @PostMapping("/inventory/decrease")
    public ResponseEntity<ApiResponse<BloodInventoryResponse>> decreaseStock(
            @Valid @RequestBody BloodStockAdjustRequest request) {
        BloodInventoryResponse response = bloodBankInventoryService.decreaseStock(request);
        return ResponseEntity.ok(ApiResponse.success("Stock decreased successfully", response));
    }

    @GetMapping("/hospital-requests")
    public ResponseEntity<ApiResponse<List<HospitalRequestResponse>>> getHospitalRequests() {
        List<HospitalRequestResponse> response = bloodBankHospitalRequestService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success("Hospital requests fetched successfully", response));
    }

    @GetMapping("/hospital-requests/{requestId}")
    public ResponseEntity<ApiResponse<HospitalRequestResponse>> getHospitalRequestById(
            @PathVariable Long requestId) {
        HospitalRequestResponse response = bloodBankHospitalRequestService.getRequestById(requestId);
        return ResponseEntity.ok(ApiResponse.success("Hospital request fetched successfully", response));
    }

    @PostMapping("/hospital-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse<HospitalRequestResponse>> approveHospitalRequest(
            @PathVariable Long requestId) {
        HospitalRequestResponse response = bloodBankHospitalRequestService.approveRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Hospital request approved successfully", response));
    }

    @PostMapping("/hospital-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<HospitalRequestResponse>> rejectHospitalRequest(
            @PathVariable Long requestId) {
        HospitalRequestResponse response = bloodBankHospitalRequestService.rejectRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Hospital request rejected successfully", response));
    }

    @GetMapping("/issue-history")
    public ResponseEntity<ApiResponse<List<BloodIssueResponse>>> getIssueHistory() {
        List<BloodIssueResponse> response = bloodBankIssueService.getIssueHistory();
        return ResponseEntity.ok(ApiResponse.success("Issue history fetched successfully", response));
    }
}
