package com.blooddonor.controller;

import com.blooddonor.dto.request.HospitalUpdateRequest;
import com.blooddonor.dto.request.PatientCreateRequest;
import com.blooddonor.dto.request.PatientTreatmentStatusUpdateRequest;
import com.blooddonor.dto.request.PatientUpdateRequest;
import com.blooddonor.dto.request.SendBloodRequestDto;
import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.dto.response.HospitalDashboardResponse;
import com.blooddonor.dto.response.HospitalResponse;
import com.blooddonor.dto.response.PatientResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.BloodRequestService;
import com.blooddonor.service.HospitalService;
import com.blooddonor.service.PatientService;
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
@RequestMapping("/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;
    private final PatientService patientService;
    private final BloodRequestService bloodRequestService;

    public HospitalController(
            HospitalService hospitalService,
            PatientService patientService,
            BloodRequestService bloodRequestService) {
        this.hospitalService = hospitalService;
        this.patientService = patientService;
        this.bloodRequestService = bloodRequestService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<HospitalResponse>> getProfile() {
        HospitalResponse response = hospitalService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateProfile(
            @Valid @RequestBody HospitalUpdateRequest request) {
        HospitalResponse response = hospitalService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        hospitalService.deleteAccount();
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<HospitalDashboardResponse>> getDashboard() {
        HospitalDashboardResponse response = hospitalService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard fetched successfully", response));
    }

    @PostMapping("/patients")
    public ResponseEntity<ApiResponse<PatientResponse>> createPatient(
            @Valid @RequestBody PatientCreateRequest request) {
        PatientResponse response = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient added successfully", response));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> listPatients() {
        List<PatientResponse> response = patientService.listPatientsForHospital();
        return ResponseEntity.ok(ApiResponse.success("Patients fetched successfully", response));
    }

    @PutMapping("/patients/{patientId}")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientUpdateRequest request) {
        PatientResponse response = patientService.updatePatient(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", response));
    }

    @PutMapping("/patients/{patientId}/treatment-status")
    public ResponseEntity<ApiResponse<PatientResponse>> updateTreatmentStatus(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientTreatmentStatusUpdateRequest request) {
        PatientResponse response = patientService.updateTreatmentStatus(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Treatment status updated successfully", response));
    }

    @PostMapping("/blood-requests")
    public ResponseEntity<ApiResponse<List<BloodRequestResponse>>> sendBloodRequests(
            @Valid @RequestBody SendBloodRequestDto request) {
        List<BloodRequestResponse> response = bloodRequestService.sendBloodRequests(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blood request(s) sent successfully", response));
    }

    @GetMapping("/blood-requests")
    public ResponseEntity<ApiResponse<List<BloodRequestResponse>>> listSentBloodRequests() {
        List<BloodRequestResponse> response = bloodRequestService.listSentRequestsForHospital();
        return ResponseEntity.ok(ApiResponse.success("Blood requests fetched successfully", response));
    }

    @GetMapping("/blood-requests/{requestId}")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> getBloodRequestStatus(
            @PathVariable Long requestId) {
        BloodRequestResponse response = bloodRequestService.getRequestStatusForHospital(requestId);
        return ResponseEntity.ok(ApiResponse.success("Blood request status fetched successfully", response));
    }
}
