package com.blooddonor.controller;

import com.blooddonor.dto.response.GeocodedLocationResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.GeocodingService;
import com.blooddonor.util.GeocodedAddress;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/geocode")
@Validated
public class GeocodeController {

    private final GeocodingService geocodingService;

    public GeocodeController(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    @GetMapping("/reverse")
    public ResponseEntity<ApiResponse<GeocodedLocationResponse>> reverseGeocode(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") double latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") double longitude) {
        GeocodedAddress geocoded = geocodingService.reverseGeocode(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Location resolved", toResponse(geocoded)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<GeocodedLocationResponse>> searchLocation(
            @RequestParam @NotBlank(message = "Search query is required") String query) {
        GeocodedAddress geocoded = geocodingService.geocodeSearchQuery(query.trim());
        return ResponseEntity.ok(ApiResponse.success("Location resolved", toResponse(geocoded)));
    }

    @GetMapping("/suggest")
    public ResponseEntity<ApiResponse<List<GeocodedLocationResponse>>> suggestLocations(
            @RequestParam @NotBlank(message = "Search query is required") String query) {
        List<GeocodedLocationResponse> suggestions = geocodingService.suggestSearchQuery(query.trim()).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Suggestions loaded", suggestions));
    }

    private GeocodedLocationResponse toResponse(GeocodedAddress geocoded) {
        return GeocodedLocationResponse.builder()
                .latitude(geocoded.latitude())
                .longitude(geocoded.longitude())
                .address(geocoded.address())
                .city(geocoded.city())
                .state(geocoded.state())
                .pincode(geocoded.pincode())
                .formattedAddress(geocoded.formattedAddress())
                .build();
    }
}