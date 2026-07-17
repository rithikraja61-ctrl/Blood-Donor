package com.blooddonor.service.impl;

import com.blooddonor.dto.request.SendBloodRequestDto;
import com.blooddonor.dto.request.UserSendBloodRequestDto;
import com.blooddonor.dto.response.AssignedDonorResponse;
import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.entity.BloodRequest;
import com.blooddonor.entity.Donor;
import com.blooddonor.entity.Hospital;
import com.blooddonor.entity.Patient;
import com.blooddonor.entity.User;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.BloodRequestMapper;
import com.blooddonor.repository.BloodRequestRepository;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.PatientRepository;
import com.blooddonor.repository.UserRepository;
import com.blooddonor.service.BloodRequestService;
import com.blooddonor.util.EligibleDonorFinder;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.Gender;
import com.blooddonor.validation.PatientRequestStatus;
import com.blooddonor.validation.RequesterType;
import com.blooddonor.validation.TreatmentStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class BloodRequestServiceImpl implements BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final DonorRepository donorRepository;
    private final UserRepository userRepository;
    private final BloodRequestMapper bloodRequestMapper;
    private final SecurityUtil securityUtil;
    private final EligibleDonorFinder eligibleDonorFinder;

    public BloodRequestServiceImpl(
            BloodRequestRepository bloodRequestRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            DonorRepository donorRepository,
            UserRepository userRepository,
            BloodRequestMapper bloodRequestMapper,
            SecurityUtil securityUtil,
            EligibleDonorFinder eligibleDonorFinder) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.donorRepository = donorRepository;
        this.userRepository = userRepository;
        this.bloodRequestMapper = bloodRequestMapper;
        this.securityUtil = securityUtil;
        this.eligibleDonorFinder = eligibleDonorFinder;
    }

    @Override
    @Transactional
    public BloodRequestResponse sendBloodRequest(SendBloodRequestDto request) {
        Hospital hospital = findCurrentHospital();
        Patient patient = patientRepository.findByIdAndHospitalId(request.getPatientId(), hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        applyPatientOverridesFromRequest(patient, request);
        patientRepository.save(patient);

        Long selectedDonorId = request.getSelectedDonorId();
        String bloodGroup = patient.getBloodType().getDisplayName();

        if (!eligibleDonorFinder.isEligibleSelectedDonor(bloodGroup, hospital.getPincode(), selectedDonorId)) {
            throw new BadRequestException(
                    "Selected donor is not eligible. Search donors again and pick a donor from the results.");
        }

        if (bloodRequestRepository.existsByPatientIdAndDonorIdAndStatus(
                patient.getId(), selectedDonorId, BloodRequestStatus.PENDING)) {
            throw new BadRequestException("A pending request already exists for this patient and donor");
        }

        Donor donor = donorRepository.findById(selectedDonorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + selectedDonorId));

        String reason = request.getReasonForBloodRequirement() != null
                && !request.getReasonForBloodRequirement().isBlank()
                ? request.getReasonForBloodRequirement()
                : patient.getReasonForBlood();

        BloodRequest bloodRequest = buildHospitalBloodRequest(
                UUID.randomUUID().toString(), hospital, patient, donor, reason, request);
        BloodRequest saved = bloodRequestRepository.save(bloodRequest);
        return bloodRequestMapper.toResponse(saved);
    }

    private void applyPatientOverridesFromRequest(Patient patient, SendBloodRequestDto request) {
        if (request.getPatientName() != null && !request.getPatientName().isBlank()) {
            patient.setPatientName(request.getPatientName());
        }
        if (request.getPatientAge() != null) {
            patient.setAge(request.getPatientAge());
        }
        if (request.getPatientGender() != null) {
            patient.setGender(request.getPatientGender());
        }
        if (request.getRequiredBloodGroup() != null) {
            patient.setBloodType(request.getRequiredBloodGroup());
        }
        if (request.getReasonForBloodRequirement() != null && !request.getReasonForBloodRequirement().isBlank()) {
            patient.setReasonForBlood(request.getReasonForBloodRequirement());
        }
    }

    @Override
    @Transactional
    public List<BloodRequestResponse> sendBloodRequestsForUser(UserSendBloodRequestDto request) {
        User user = findCurrentUser();

        if (user.getBloodType() == null) {
            throw new BadRequestException("Blood group is required on your profile before sending a request");
        }

        if (user.getPincode() == null || user.getPincode().isBlank()) {
            throw new BadRequestException("Pincode is required on your profile before sending a request");
        }

        String reason = request.getReasonForBloodRequirement() != null
                && !request.getReasonForBloodRequirement().isBlank()
                ? request.getReasonForBloodRequirement()
                : "Blood required";

        String bloodGroup = user.getBloodType().getDisplayName();
        List<Donor> nearbyDonors = eligibleDonorFinder.findNearbyEligibleDonors(bloodGroup, user.getPincode());

        if (nearbyDonors.isEmpty()) {
            throw new BadRequestException("No eligible donors found nearby");
        }

        String requestGroupId = UUID.randomUUID().toString();
        List<BloodRequestResponse> responses = new ArrayList<>();

        for (Donor donor : nearbyDonors) {
            if (bloodRequestRepository.existsByUserIdAndDonorIdAndStatus(
                    user.getId(), donor.getId(), BloodRequestStatus.PENDING)) {
                continue;
            }

            BloodRequest bloodRequest = buildUserBloodRequest(
                    requestGroupId, user, donor, reason, request);
            responses.add(bloodRequestMapper.toResponse(bloodRequestRepository.save(bloodRequest)));
        }

        if (responses.isEmpty()) {
            throw new BadRequestException("No eligible donors found nearby");
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
    public AssignedDonorResponse getAssignedDonorForRequest(Long requestId) {
        Long hospitalId = findCurrentHospital().getId();
        BloodRequest request = bloodRequestRepository.findByIdAndHospitalId(requestId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));

        if (request.getStatus() != BloodRequestStatus.ACCEPTED
                && request.getStatus() != BloodRequestStatus.COMPLETED) {
            throw new BadRequestException("Donor is not assigned until the request is accepted");
        }

        return toAssignedDonorResponse(request);
    }

    @Override
    public AssignedDonorResponse getAssignedDonorForPatient(Long patientId) {
        Hospital hospital = findCurrentHospital();
        Patient patient = patientRepository.findByIdAndHospitalId(patientId, hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!patient.isDonorAssigned() || patient.getAssignedDonor() == null) {
            throw new BadRequestException("No donor assigned to this patient yet");
        }

        BloodRequest acceptedRequest = bloodRequestRepository
                .findTopByPatientIdAndStatusOrderByCreatedAtDesc(patientId, BloodRequestStatus.ACCEPTED)
                .or(() -> bloodRequestRepository.findTopByPatientIdAndStatusOrderByCreatedAtDesc(
                        patientId, BloodRequestStatus.COMPLETED))
                .orElseThrow(() -> new ResourceNotFoundException("Accepted blood request not found for patient"));

        return toAssignedDonorResponse(acceptedRequest);
    }

    private AssignedDonorResponse toAssignedDonorResponse(BloodRequest request) {
        Donor donor = request.getDonor();
        return AssignedDonorResponse.builder()
                .donorId(donor.getId())
                .donorName(donor.getName())
                .email(donor.getEmail())
                .phoneNumber(donor.getPhoneNumber())
                .bloodType(donor.getBloodType())
                .bloodGroup(donor.getBloodType().getDisplayName())
                .city(donor.getCity())
                .pincode(donor.getPincode())
                .bloodRequestId(request.getId())
                .bloodRequestStatus(request.getStatus().name())
                .build();
    }

    @Override
    public List<BloodRequestResponse> listSentRequestsForUser() {
        Long userId = findCurrentUser().getId();
        return bloodRequestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(bloodRequestMapper::toResponse)
                .toList();
    }

    @Override
    public BloodRequestResponse getRequestStatusForUser(Long requestId) {
        Long userId = findCurrentUser().getId();
        BloodRequest request = bloodRequestRepository.findByIdAndUserId(requestId, userId)
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

        expireOtherPendingInGroup(request.getRequestGroupId(), request.getId());

        Patient patient = request.getPatient();
        if (patient != null) {
            Donor acceptingDonor = request.getDonor();
            patient.setDonorAssigned(true);
            patient.setAssignedDonor(acceptingDonor);
            patient.setPatientRequestStatus(PatientRequestStatus.DONOR_RECEIVED);
            if (patient.getTreatmentStatus() == TreatmentStatus.WAITING) {
                patient.setTreatmentStatus(TreatmentStatus.BLOOD_ARRANGED);
            }
            patientRepository.save(patient);
        }

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

    private void expireOtherPendingInGroup(String requestGroupId, Long acceptedRequestId) {
        List<BloodRequest> pendingInGroup = bloodRequestRepository.findByRequestGroupIdAndStatus(
                requestGroupId, BloodRequestStatus.PENDING);
        LocalDateTime now = LocalDateTime.now();

        for (BloodRequest other : pendingInGroup) {
            if (!other.getId().equals(acceptedRequestId)) {
                other.setStatus(BloodRequestStatus.EXPIRED);
                other.setRespondedAt(now);
                bloodRequestRepository.save(other);
            }
        }
    }

    private BloodRequest buildHospitalBloodRequest(
            String requestGroupId,
            Hospital hospital,
            Patient patient,
            Donor donor,
            String reason,
            SendBloodRequestDto request) {
        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setRequestGroupId(requestGroupId);
        bloodRequest.setRequesterType(RequesterType.HOSPITAL);
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
        bloodRequest.setContactPersonName(hospital.getName());
        bloodRequest.setContactPhoneNumber(hospital.getPhoneNumber());
        bloodRequest.setEmergencyLevel(request.getEmergencyLevel());
        bloodRequest.setRequiredBeforeDateTime(request.getRequiredBeforeDateTime());
        bloodRequest.setStatus(BloodRequestStatus.PENDING);
        return bloodRequest;
    }

    private BloodRequest buildUserBloodRequest(
            String requestGroupId,
            User user,
            Donor donor,
            String reason,
            UserSendBloodRequestDto request) {
        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setRequestGroupId(requestGroupId);
        bloodRequest.setRequesterType(RequesterType.USER);
        bloodRequest.setUser(user);
        bloodRequest.setDonor(donor);
        bloodRequest.setPatientName(user.getName());
        bloodRequest.setPatientAge(0);
        bloodRequest.setPatientGender(Gender.OTHER);
        bloodRequest.setRequiredBloodGroup(user.getBloodType());
        bloodRequest.setUnitsOfBloodRequired(request.getUnitsOfBloodRequired());
        bloodRequest.setReasonForBloodRequirement(reason);
        bloodRequest.setHospitalName(user.getName());
        bloodRequest.setHospitalAddress(user.getAddress());
        bloodRequest.setHospitalCity("");
        bloodRequest.setHospitalPinCode(user.getPincode());
        bloodRequest.setContactPersonName(request.getContactPersonName());
        bloodRequest.setContactPhoneNumber(request.getContactPhoneNumber());
        bloodRequest.setEmergencyLevel(request.getEmergencyLevel());
        bloodRequest.setRequiredBeforeDateTime(request.getRequiredBeforeDateTime());
        bloodRequest.setStatus(BloodRequestStatus.PENDING);
        return bloodRequest;
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

    private User findCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
