package com.blooddonor.service.impl;

import com.blooddonor.dto.request.SendBloodRequestDto;
import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.entity.BloodRequest;
import com.blooddonor.entity.Donor;
import com.blooddonor.entity.Hospital;
import com.blooddonor.entity.Patient;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.BloodRequestMapper;
import com.blooddonor.repository.BloodRequestRepository;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.PatientRepository;
import com.blooddonor.service.BloodRequestService;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.TreatmentStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BloodRequestServiceImpl implements BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final DonorRepository donorRepository;
    private final BloodRequestMapper bloodRequestMapper;
    private final SecurityUtil securityUtil;

    public BloodRequestServiceImpl(
            BloodRequestRepository bloodRequestRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            DonorRepository donorRepository,
            BloodRequestMapper bloodRequestMapper,
            SecurityUtil securityUtil) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.donorRepository = donorRepository;
        this.bloodRequestMapper = bloodRequestMapper;
        this.securityUtil = securityUtil;
    }

    @Override
    @Transactional
    public List<BloodRequestResponse> sendBloodRequests(SendBloodRequestDto request) {
        Hospital hospital = findCurrentHospital();
        Patient patient = patientRepository.findByIdAndHospitalId(request.getPatientId(), hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        String reason = request.getReasonForBloodRequirement() != null
                && !request.getReasonForBloodRequirement().isBlank()
                ? request.getReasonForBloodRequirement()
                : patient.getReasonForBlood();

        List<BloodRequestResponse> responses = new ArrayList<>();
        for (Long donorId : request.getDonorIds()) {
            if (bloodRequestRepository.existsByPatientIdAndDonorIdAndStatus(
                    patient.getId(), donorId, BloodRequestStatus.PENDING)) {
                throw new BadRequestException("A pending request already exists for donor id: " + donorId);
            }

            Donor donor = donorRepository.findById(donorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + donorId));

            if (!donor.isActive() || donor.isBlocked() || !donor.isAvailable()) {
                throw new BadRequestException("Donor is not eligible to receive requests: " + donorId);
            }

            BloodRequest bloodRequest = new BloodRequest();
            bloodRequest.setHospital(hospital);
            bloodRequest.setPatient(patient);
            bloodRequest.setDonor(donor);
            bloodRequest.setPatientName(patient.getPatientName());
            bloodRequest.setPatientAge(patient.getAge());
            bloodRequest.setPatientGender(patient.getGender());
            bloodRequest.setRequiredBloodGroup(patient.getBloodType());
            bloodRequest.setUnitsOfBloodRequired(patient.getUnitsRequired());
            bloodRequest.setReasonForBloodRequirement(reason);
            bloodRequest.setHospitalName(hospital.getName());
            bloodRequest.setHospitalAddress(hospital.getAddress());
            bloodRequest.setHospitalCity(hospital.getCity());
            bloodRequest.setHospitalPinCode(hospital.getPincode());
            bloodRequest.setContactPersonName(request.getContactPersonName());
            bloodRequest.setContactPhoneNumber(request.getContactPhoneNumber());
            bloodRequest.setEmergencyLevel(request.getEmergencyLevel());
            bloodRequest.setRequiredBeforeDateTime(request.getRequiredBeforeDateTime());
            bloodRequest.setStatus(BloodRequestStatus.PENDING);

            BloodRequest saved = bloodRequestRepository.save(bloodRequest);
            responses.add(bloodRequestMapper.toResponse(saved));
        }
        return responses;
    }

    @Override
    public List<BloodRequestResponse> listSentRequestsForHospital() {
        Long hospitalId = findCurrentHospital().getId();
        return bloodRequestRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId).stream()
                .map(bloodRequestMapper::toResponse)
                .toList();
    }

    @Override
    public BloodRequestResponse getRequestStatusForHospital(Long requestId) {
        Long hospitalId = findCurrentHospital().getId();
        BloodRequest request = bloodRequestRepository.findByIdAndHospitalId(requestId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));
        return bloodRequestMapper.toResponse(request);
    }

    @Override
    public List<BloodRequestResponse> listIncomingForDonor() {
        Long donorId = securityUtil.getCurrentUserId();
        return bloodRequestRepository.findByDonorIdOrderByCreatedAtDesc(donorId).stream()
                .map(bloodRequestMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BloodRequestResponse acceptRequest(Long requestId) {
        BloodRequest request = findPendingRequestForDonor(requestId);
        request.setStatus(BloodRequestStatus.ACCEPTED);
        request.setRespondedAt(LocalDateTime.now());

        Patient patient = request.getPatient();
        patient.setDonorAssigned(true);
        if (patient.getTreatmentStatus() == TreatmentStatus.WAITING) {
            patient.setTreatmentStatus(TreatmentStatus.BLOOD_ARRANGED);
        }
        patientRepository.save(patient);

        return bloodRequestMapper.toResponse(bloodRequestRepository.save(request));
    }

    @Override
    @Transactional
    public BloodRequestResponse rejectRequest(Long requestId) {
        BloodRequest request = findPendingRequestForDonor(requestId);
        request.setStatus(BloodRequestStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());
        return bloodRequestMapper.toResponse(bloodRequestRepository.save(request));
    }

    private BloodRequest findPendingRequestForDonor(Long requestId) {
        Long donorId = securityUtil.getCurrentUserId();
        BloodRequest request = bloodRequestRepository.findByIdAndDonorId(requestId, donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));

        if (request.getStatus() != BloodRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be accepted or rejected");
        }
        return request;
    }

    private Hospital findCurrentHospital() {
        Long hospitalId = securityUtil.getCurrentUserId();
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }
}
