package com.blooddonor.controller;

import com.blooddonor.dto.request.CreateHospitalRequestDto;
import com.blooddonor.dto.request.HospitalUpdateRequest;
import com.blooddonor.dto.request.PatientCreateRequest;
import com.blooddonor.dto.request.PatientUpdateRequest;
import com.blooddonor.dto.request.SendBloodRequestDto;
import com.blooddonor.dto.response.AssignedDonorResponse;
import com.blooddonor.dto.response.BloodBankSummaryResponse;
import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.dto.response.HospitalDashboardResponse;
import com.blooddonor.dto.response.HospitalRequestResponse;
import com.blooddonor.dto.response.HospitalResponse;
import com.blooddonor.dto.response.PatientResponse;
import com.blooddonor.response.ApiResponse;
import com.blooddonor.service.BloodBankHospitalRequestService;
import com.blooddonor.service.BloodBankService;
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
    private final BloodBankHospitalRequestService bloodBankHospitalRequestService;
    private final BloodBankService bloodBankService;

    public HospitalController(
            HospitalService hospitalService,
            PatientService patientService,
            BloodRequestService bloodRequestService,
            BloodBankHospitalRequestService bloodBankHospitalRequestService,
            BloodBankService bloodBankService) {
        this.hospitalService = hospitalService;
        this.patientService = patientService;
        this.bloodRequestService = bloodRequestService;
        this.bloodBankHospitalRequestService = bloodBankHospitalRequestService;
        this.bloodBankService = bloodBankService;
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

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatient(
            @PathVariable Long patientId) {
        PatientResponse response = patientService.getPatientById(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient fetched successfully", response));
    }

    @PutMapping("/patients/{patientId}")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientUpdateRequest request) {
        PatientResponse response = patientService.updatePatient(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", response));
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long patientId) {
        patientService.deletePatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully"));
    }

    @GetMapping("/patients/{patientId}/assigned-donor")
    public ResponseEntity<ApiResponse<AssignedDonorResponse>> getAssignedDonorForPatient(
            @PathVariable Long patientId) {
        AssignedDonorResponse response = bloodRequestService.getAssignedDonorForPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Assigned donor fetched successfully", response));
    }

    @GetMapping("/blood-banks")
    public ResponseEntity<ApiResponse<List<BloodBankSummaryResponse>>> listBloodBanks() {
        List<BloodBankSummaryResponse> response = bloodBankService.listBloodBanksForHospital();
        return ResponseEntity.ok(ApiResponse.success("Blood banks fetched successfully", response));
    }

    @PostMapping("/blood-bank-requests")
    public ResponseEntity<ApiResponse<HospitalRequestResponse>> sendBloodBankRequest(
            @Valid @RequestBody CreateHospitalRequestDto request) {
        HospitalRequestResponse response = bloodBankHospitalRequestService.createRequestFromHospital(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blood bank request sent successfully", response));
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
    public ResponseEntity<ApiResponse<BloodRequestResponse>> getBloodRequestDetails(
            @PathVariable Long requestId) {
        BloodRequestResponse response = bloodRequestService.getRequestStatusForHospital(requestId);
        return ResponseEntity.ok(ApiResponse.success("Blood request fetched successfully", response));
    }

    @GetMapping("/blood-requests/{requestId}/status")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> getBloodRequestStatus(
            @PathVariable Long requestId) {
        BloodRequestResponse response = bloodRequestService.getRequestStatusForHospital(requestId);
        return ResponseEntity.ok(ApiResponse.success("Blood request status fetched successfully", response));
    }

    @GetMapping("/blood-requests/{requestId}/assigned-donor")
    public ResponseEntity<ApiResponse<AssignedDonorResponse>> getAssignedDonorForRequest(
            @PathVariable Long requestId) {
        AssignedDonorResponse response = bloodRequestService.getAssignedDonorForRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Assigned donor fetched successfully", response));
    }
}
