package com.blooddonor.controller;

import com.blooddonor.dto.request.LiveLocationRequest;
import com.blooddonor.dto.request.UserBloodBankRequestDto;
import com.blooddonor.dto.request.UserSendBloodRequestDto;
import com.blooddonor.dto.request.UserUpdateRequest;
import com.blooddonor.dto.response.BloodBankSummaryResponse;
import com.blooddonor.dto.response.BloodRequestGroupSummaryResponse;
import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.dto.response.HospitalRequestResponse;
import com.blooddonor.dto.response.UserResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.BloodBankHospitalRequestService;
import com.blooddonor.service.BloodRequestService;
import com.blooddonor.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final BloodRequestService bloodRequestService;
    private final BloodBankHospitalRequestService bloodBankHospitalRequestService;

    public UserController(
            UserService userService,
            BloodRequestService bloodRequestService,
            BloodBankHospitalRequestService bloodBankHospitalRequestService) {
        this.userService = userService;
        this.bloodRequestService = bloodRequestService;
        this.bloodBankHospitalRequestService = bloodBankHospitalRequestService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        UserResponse response = userService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/me/live-location")
    public ResponseEntity<ApiResponse<UserResponse>> updateLiveLocation(
            @Valid @RequestBody LiveLocationRequest request) {
        UserResponse response = userService.updateLiveLocation(request);
        return ResponseEntity.ok(ApiResponse.success("Live location updated", response));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    @GetMapping("/bloodbanks")
    public ResponseEntity<ApiResponse<List<BloodBankSummaryResponse>>> listBloodBanks() {
        List<BloodBankSummaryResponse> response = userService.listAvailableBloodBanks();
        return ResponseEntity.ok(ApiResponse.success("Blood banks fetched successfully", response));
    }

    @PostMapping("/blood-bank-requests")
    public ResponseEntity<ApiResponse<HospitalRequestResponse>> sendBloodBankRequest(
            @Valid @RequestBody UserBloodBankRequestDto request) {
        HospitalRequestResponse response = bloodBankHospitalRequestService.createRequestFromUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blood bank request sent successfully", response));
    }

    @PostMapping("/blood-requests")
    public ResponseEntity<ApiResponse<List<BloodRequestResponse>>> sendBloodRequests(
            @Valid @RequestBody UserSendBloodRequestDto request) {
        List<BloodRequestResponse> response = bloodRequestService.sendBloodRequestsForUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blood request(s) sent successfully", response));
    }

    @GetMapping("/blood-requests")
    public ResponseEntity<ApiResponse<List<BloodRequestResponse>>> listSentBloodRequests() {
        List<BloodRequestResponse> response = bloodRequestService.listSentRequestsForUser();
        return ResponseEntity.ok(ApiResponse.success("Blood requests fetched successfully", response));
    }

    @GetMapping("/blood-requests/groups/{requestGroupId}")
    public ResponseEntity<ApiResponse<BloodRequestGroupSummaryResponse>> getBloodRequestGroupSummary(
            @PathVariable String requestGroupId) {
        BloodRequestGroupSummaryResponse response =
                bloodRequestService.getRequestGroupSummaryForUser(requestGroupId);
        return ResponseEntity.ok(ApiResponse.success("Blood request group summary fetched successfully", response));
    }

    @GetMapping("/blood-requests/{requestId}")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> getBloodRequestStatus(
            @PathVariable Long requestId) {
        BloodRequestResponse response = bloodRequestService.getRequestStatusForUser(requestId);
        return ResponseEntity.ok(ApiResponse.success("Blood request status fetched successfully", response));
    }
}
