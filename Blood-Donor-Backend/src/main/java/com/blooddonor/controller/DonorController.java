package com.blooddonor.controller;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.dto.response.DonorSearchResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.DonorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/donors")
@Validated
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DonorSearchResponse>>> searchDonors(
            @RequestParam @NotBlank(message = "Blood group is required") String bloodGroup,
            @RequestParam("pinCode")
            @NotBlank(message = "PIN code is required")
            @Pattern(regexp = "^[0-9]{6}$", message = "PIN code must be 6 digits")
            String pinCode) {
        List<DonorSearchResponse> donors = donorService.searchDonors(bloodGroup, pinCode);
        return ResponseEntity.ok(ApiResponse.success("Donors fetched successfully", donors));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<DonorResponse>> getProfile() {
        DonorResponse response = donorService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
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
}
