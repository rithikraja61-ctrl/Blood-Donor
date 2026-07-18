package com.blooddonor.service.impl;

import com.blooddonor.dto.request.CreateHospitalRequestDto;
import com.blooddonor.dto.response.HospitalRequestResponse;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.entity.BloodIssue;
import com.blooddonor.entity.Hospital;
import com.blooddonor.entity.HospitalRequest;
import com.blooddonor.entity.Patient;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.exception.BloodBankNotFoundException;
import com.blooddonor.exception.RequestAlreadyProcessedException;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.BloodBankModuleMapper;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.BloodIssueRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.HospitalRequestRepository;
import com.blooddonor.repository.PatientRepository;
import com.blooddonor.service.BloodBankHospitalRequestService;
import com.blooddonor.service.BloodBankInventoryService;
import com.blooddonor.service.HospitalNotificationService;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodIssueStatus;
import com.blooddonor.validation.EmergencyLevel;
import com.blooddonor.validation.HospitalRequestStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BloodBankHospitalRequestServiceImpl implements BloodBankHospitalRequestService {

    private final HospitalRequestRepository hospitalRequestRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final BloodBankRepository bloodBankRepository;
    private final BloodIssueRepository bloodIssueRepository;
    private final BloodBankInventoryService bloodBankInventoryService;
    private final BloodBankModuleMapper bloodBankModuleMapper;
    private final HospitalNotificationService hospitalNotificationService;
    private final SecurityUtil securityUtil;

    public BloodBankHospitalRequestServiceImpl(
            HospitalRequestRepository hospitalRequestRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            BloodBankRepository bloodBankRepository,
            BloodIssueRepository bloodIssueRepository,
            BloodBankInventoryService bloodBankInventoryService,
            BloodBankModuleMapper bloodBankModuleMapper,
            HospitalNotificationService hospitalNotificationService,
            SecurityUtil securityUtil) {
        this.hospitalRequestRepository = hospitalRequestRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.bloodIssueRepository = bloodIssueRepository;
        this.bloodBankInventoryService = bloodBankInventoryService;
        this.bloodBankModuleMapper = bloodBankModuleMapper;
        this.hospitalNotificationService = hospitalNotificationService;
        this.securityUtil = securityUtil;
    }

    @Override
    @Transactional
    public HospitalRequestResponse createRequestFromHospital(CreateHospitalRequestDto request) {
        Hospital hospital = findCurrentHospital();
        Patient patient = patientRepository.findByIdAndHospitalId(request.getPatientId(), hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        BloodBank bloodBank = bloodBankRepository.findById(request.getBloodBankId())
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));

        String reason = request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim()
                : patient.getReasonForBlood();

        HospitalRequest hospitalRequest = new HospitalRequest();
        hospitalRequest.setHospital(hospital);
        hospitalRequest.setBloodBank(bloodBank);
        hospitalRequest.setHospitalName(hospital.getName());
        hospitalRequest.setPatientName(patient.getPatientName());
        hospitalRequest.setPatientAge(patient.getAge());
        hospitalRequest.setGender(patient.getGender());
        hospitalRequest.setBloodGroup(patient.getBloodType());
        hospitalRequest.setRequiredUnits(patient.getUnitsRequired());
        hospitalRequest.setEmergencyLevel(request.getEmergencyLevel());
        hospitalRequest.setReason(reason);
        hospitalRequest.setRequiredBefore(request.getRequiredBefore());
        hospitalRequest.setHospitalContact(request.getHospitalContact());
        hospitalRequest.setStatus(HospitalRequestStatus.PENDING);

        HospitalRequest saved = hospitalRequestRepository.save(hospitalRequest);
        hospitalNotificationService.notifyBloodBankNewHospitalRequest(bloodBank.getId(), saved.getId());
        return bloodBankModuleMapper.toHospitalRequestResponse(saved);
    }

    @Override
    @Transactional
    public List<HospitalRequestResponse> getAllRequests() {
        BloodBank bloodBank = findCurrentBloodBank();
        expirePendingRequests(bloodBank.getId());
        return hospitalRequestRepository.findByBloodBankIdAndStatus(
                        bloodBank.getId(), HospitalRequestStatus.PENDING).stream()
                .map(bloodBankModuleMapper::toHospitalRequestResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HospitalRequestResponse getRequestById(Long requestId) {
        BloodBank bloodBank = findCurrentBloodBank();
        HospitalRequest request = findRequestForBloodBank(requestId, bloodBank.getId());
        return bloodBankModuleMapper.toHospitalRequestResponse(request);
    }

    @Override
    @Transactional
    public HospitalRequestResponse approveRequest(Long requestId) {
        BloodBank bloodBank = findCurrentBloodBank();
        HospitalRequest request = findRequestForBloodBank(requestId, bloodBank.getId());
        validatePendingRequest(request);

        bloodBankInventoryService.issueUnits(
                bloodBank.getId(),
                request.getBloodGroup().getDisplayName(),
                request.getRequiredUnits(),
                request.getId());

        request.setStatus(HospitalRequestStatus.COMPLETED);
        request.setProcessedAt(LocalDateTime.now());
        HospitalRequest savedRequest = hospitalRequestRepository.save(request);

        BloodIssue issue = new BloodIssue();
        issue.setBloodBank(bloodBank);
        issue.setHospital(request.getHospital());
        issue.setHospitalRequest(savedRequest);
        issue.setHospitalName(savedRequest.getHospitalName());
        issue.setPatientName(savedRequest.getPatientName());
        issue.setBloodGroup(savedRequest.getBloodGroup());
        issue.setUnits(savedRequest.getRequiredUnits());
        issue.setIssueDate(LocalDateTime.now());
        issue.setIssuedBy(bloodBank.getName());
        issue.setStatus(BloodIssueStatus.ISSUED);
        bloodIssueRepository.save(issue);

        hospitalNotificationService.notifyHospitalRequestApproved(
                request.getHospital().getId(), request.getId());

        return bloodBankModuleMapper.toHospitalRequestResponse(savedRequest);
    }

    @Override
    @Transactional
    public HospitalRequestResponse rejectRequest(Long requestId) {
        BloodBank bloodBank = findCurrentBloodBank();
        HospitalRequest request = findRequestForBloodBank(requestId, bloodBank.getId());
        validatePendingRequest(request);

        request.setStatus(HospitalRequestStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());
        HospitalRequest saved = hospitalRequestRepository.save(request);

        hospitalNotificationService.notifyHospitalRequestRejected(
                request.getHospital().getId(), request.getId(), "Request rejected by blood bank");

        return bloodBankModuleMapper.toHospitalRequestResponse(saved);
    }

    private void expirePendingRequests(Long bloodBankId) {
        LocalDateTime now = LocalDateTime.now();
        List<HospitalRequest> pending = hospitalRequestRepository.findByBloodBankIdAndStatus(
                bloodBankId, HospitalRequestStatus.PENDING);
        for (HospitalRequest request : pending) {
            if (request.getRequiredBefore().isBefore(now)) {
                request.setStatus(HospitalRequestStatus.EXPIRED);
                request.setProcessedAt(now);
                hospitalRequestRepository.save(request);
            }
        }
    }

    private void validatePendingRequest(HospitalRequest request) {
        if (request.getStatus() != HospitalRequestStatus.PENDING) {
            throw new RequestAlreadyProcessedException("Request has already been processed");
        }
        if (request.getRequiredBefore().isBefore(LocalDateTime.now())) {
            request.setStatus(HospitalRequestStatus.EXPIRED);
            request.setProcessedAt(LocalDateTime.now());
            hospitalRequestRepository.save(request);
            throw new BadRequestException("Request has expired");
        }
    }

    private HospitalRequest findRequestForBloodBank(Long requestId, Long bloodBankId) {
        return hospitalRequestRepository.findByIdAndBloodBankId(requestId, bloodBankId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital request not found"));
    }

    private BloodBank findCurrentBloodBank() {
        Long bloodBankId = securityUtil.getCurrentUserId();
        return bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));
    }

    private Hospital findCurrentHospital() {
        Long hospitalId = securityUtil.getCurrentUserId();
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }
}
