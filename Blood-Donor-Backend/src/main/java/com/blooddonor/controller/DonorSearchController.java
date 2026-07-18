package com.blooddonor.controller;

import com.blooddonor.dto.response.CursorDonorSearchResponse;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.DonorService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/donors")
@Validated
public class DonorSearchController {

    private final DonorService donorService;

    public DonorSearchController(DonorService donorService) {
        this.donorService = donorService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<CursorDonorSearchResponse>> searchDonors(
            @RequestParam @NotBlank(message = "Blood group is required") String bloodGroup,
            @RequestParam(value = "pinCode", required = false) String pinCode,
            @RequestParam(required = false) @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @RequestParam(required = false) @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @RequestParam(required = false) @Min(1) @Max(200) Double radiusKm,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit,
            @RequestParam(required = false) String nextCursor,
            @RequestParam(required = false) String previousCursor) {
        if ((latitude == null || longitude == null) && (pinCode == null || pinCode.isBlank())) {
            throw new BadRequestException("Provide either latitude/longitude or a PIN code for donor search");
        }
        if (pinCode != null && !pinCode.isBlank() && !pinCode.matches("^[0-9]{6}$")) {
            throw new BadRequestException("PIN code must be 6 digits");
        }

        CursorDonorSearchResponse response = donorService.searchDonors(
                bloodGroup, pinCode, latitude, longitude, radiusKm, limit, nextCursor, previousCursor);
        return ResponseEntity.ok(ApiResponse.success("Donors fetched successfully", response));
    }
}
