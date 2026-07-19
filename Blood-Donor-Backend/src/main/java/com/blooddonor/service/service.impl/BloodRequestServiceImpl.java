package com.blooddonor.service.impl;

import com.blooddonor.dto.request.BloodBankSendBloodRequestDto;
import com.blooddonor.dto.request.LiveLocationRequest;
import com.blooddonor.dto.request.SendBloodRequestDto;
import com.blooddonor.dto.request.UserSendBloodRequestDto;
import com.blooddonor.dto.response.AcceptedDonorLocationResponse;
import com.blooddonor.dto.response.AssignedDonorResponse;
import com.blooddonor.dto.response.BloodRequestGroupSummaryResponse;
import com.blooddonor.dto.response.BloodRequestResponse;
import com.blooddonor.entity.BaseAccount;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.entity.BloodRequest;
import com.blooddonor.entity.Donor;
import com.blooddonor.entity.Hospital;
import com.blooddonor.entity.Patient;
import com.blooddonor.entity.User;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.BloodRequestMapper;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.BloodRequestRepository;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.PatientRepository;
import com.blooddonor.repository.UserRepository;
import com.blooddonor.service.BloodRequestService;
import com.blooddonor.config.GoogleMapsProperties;
import com.blooddonor.util.GeoCoordinates;
import com.blooddonor.util.GeoDistanceUtil;
import com.blooddonor.util.EligibleDonorFinder;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.Gender;
import com.blooddonor.validation.PatientRequestStatus;
import com.blooddonor.validation.RequesterType;
import com.blooddonor.validation.TreatmentStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
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
    private final BloodBankRepository bloodBankRepository;
    private final BloodRequestMapper bloodRequestMapper;
    private final SecurityUtil securityUtil;
    private final EligibleDonorFinder eligibleDonorFinder;
    private final GoogleMapsProperties googleMapsProperties;

    public BloodRequestServiceImpl(
            BloodRequestRepository bloodRequestRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            DonorRepository donorRepository,
            UserRepository userRepository,
            BloodBankRepository bloodBankRepository,
            BloodRequestMapper bloodRequestMapper,
            SecurityUtil securityUtil,
            EligibleDonorFinder eligibleDonorFinder,
            GoogleMapsProperties googleMapsProperties) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.donorRepository = donorRepository;
        this.userRepository = userRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.bloodRequestMapper = bloodRequestMapper;
        this.securityUtil = securityUtil;
        this.eligibleDonorFinder = eligibleDonorFinder;
        this.googleMapsProperties = googleMapsProperties;
    }

    @Override
    @Transactional
    public List<BloodRequestResponse> sendBloodRequests(SendBloodRequestDto request) {
        Hospital hospital = findCurrentHospital();
        Patient patient = patientRepository.findByIdAndHospitalId(request.getPatientId(), hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (hospital.getPincode() == null || hospital.getPincode().isBlank()) {
            throw new BadRequestException("Pincode is required on your hospital profile before sending a request");
        }

        String reason = request.getReasonForBloodRequirement() != null
                && !request.getReasonForBloodRequirement().isBlank()
                ? request.getReasonForBloodRequirement()
                : patient.getReasonForBlood();

        expirePendingRequestsForPatient(patient.getId());

        syncLiveLocation(hospital, request.getLatitude(), request.getLongitude());

        String bloodGroup = patient.getBloodType().getDisplayName();
        GeoCoordinates origin = resolveRequestOrigin(request.getLatitude(), request.getLongitude(), hospital);
        double radiusKm = request.getRadiusKm() != null
                ? request.getRadiusKm()
                : googleMapsProperties.getDefaultSearchRadiusKm();

        List<Donor> targetDonors = resolveTargetDonorsForHospital(
                request, bloodGroup, origin, hospital.getPincode(), radiusKm);

        if (targetDonors.isEmpty()) {
            throw new BadRequestException("No eligible donors found nearby");
        }

        String requestGroupId = UUID.randomUUID().toString();
        List<BloodRequestResponse> responses = new ArrayList<>();

        for (Donor donor : targetDonors) {
            BloodRequest bloodRequest = buildHospitalBloodRequest(
                    requestGroupId, hospital, patient, donor, reason, request);
            responses.add(bloodRequestMapper.toResponse(bloodRequestRepository.save(bloodRequest)));
        }

        return responses;
    }

    private List<Donor> resolveTargetDonorsForHospital(
            SendBloodRequestDto request,
            String bloodGroup,
            GeoCoordinates origin,
            String pinCodeFallback,
            double radiusKm) {
        if (request.getDonorIds() != null && !request.getDonorIds().isEmpty()) {
            List<Long> uniqueIds = request.getDonorIds().stream().distinct().toList();
            List<Donor> selectedDonors = new ArrayList<>();
            for (Long donorId : uniqueIds) {
                if (!eligibleDonorFinder.isEligibleSelectedDonor(
                        bloodGroup, origin, pinCodeFallback, donorId, radiusKm)) {
                    throw new BadRequestException(
                            "Selected donor is not eligible within " + (int) radiusKm + " km radius");
                }
                Donor donor = donorRepository.findById(donorId)
                        .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
                selectedDonors.add(donor);
            }
            return selectedDonors;
        }

        return eligibleDonorFinder.findNearbyEligibleDonors(
                bloodGroup, origin, pinCodeFallback, radiusKm);
    }

    @Override
    @Transactional
    public List<BloodRequestResponse> sendBloodRequestsForBloodBank(BloodBankSendBloodRequestDto request) {
        BloodBank bloodBank = findCurrentBloodBank();

        if (bloodBank.getPincode() == null || bloodBank.getPincode().isBlank()) {
            throw new BadRequestException("Pincode is required on your profile before sending a request");
        }

        String reason = request.getReasonForBloodRequirement() != null
                && !request.getReasonForBloodRequirement().isBlank()
                ? request.getReasonForBloodRequirement()
                : "Blood required";

        syncLiveLocation(bloodBank, request.getLatitude(), request.getLongitude());

        String bloodGroup = request.getBloodType().getDisplayName();
        GeoCoordinates origin = resolveRequestOrigin(request.getLatitude(), request.getLongitude(), bloodBank);
        List<Donor> nearbyDonors = eligibleDonorFinder.findNearbyEligibleDonors(
                bloodGroup,
                origin,
                bloodBank.getPincode(),
                googleMapsProperties.getDefaultSearchRadiusKm());

        if (nearbyDonors.isEmpty()) {
            throw new BadRequestException("No eligible donors found nearby");
        }

        String requestGroupId = UUID.randomUUID().toString();
        List<BloodRequestResponse> responses = new ArrayList<>();

        for (Donor donor : nearbyDonors) {
            BloodRequest bloodRequest = buildBloodBankBloodRequest(
                    requestGroupId, bloodBank, donor, reason, request);
            responses.add(bloodRequestMapper.toResponse(bloodRequestRepository.save(bloodRequest)));
        }

        return responses;
    }

    @Override
    public List<BloodRequestResponse> listReceivedRoutingRequestsForBloodBank() {
        return bloodRequestRepository.findByRequesterTypeInAndStatusOrderByCreatedAtDesc(
                        List.of(RequesterType.USER, RequesterType.HOSPITAL), BloodRequestStatus.PENDING).stream()
                .map(bloodRequestMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BloodRequestResponse acceptReceivedRequestForBloodBank(Long requestId) {
        BloodRequest request = findReceivedRoutingRequest(requestId);
        return acceptPendingBloodRequest(request);
    }

    @Override
    @Transactional
    public BloodRequestResponse rejectReceivedRequestForBloodBank(Long requestId) {
        BloodRequest request = findReceivedRoutingRequest(requestId);
        rejectPendingGroup(request.getRequestGroupId());
        return bloodRequestMapper.toResponse(request);
    }

    @Override
    public List<BloodRequestResponse> listSentRequestsForBloodBank() {
        Long bloodBankId = findCurrentBloodBank().getId();
        return bloodRequestRepository.findByBloodBankIdOrderByCreatedAtDesc(bloodBankId).stream()
                .map(bloodRequestMapper::toResponse)
                .toList();
    }

    private void expirePendingRequestsForPatient(Long patientId) {
        List<BloodRequest> pendingRequests = bloodRequestRepository.findByPatientIdAndStatus(
                patientId, BloodRequestStatus.PENDING);
        LocalDateTime now = LocalDateTime.now();

        for (BloodRequest pending : pendingRequests) {
            pending.setStatus(BloodRequestStatus.EXPIRED);
            pending.setRespondedAt(now);
            bloodRequestRepository.save(pending);
        }
    }

    private BloodRequest buildBloodBankBloodRequest(
            String requestGroupId,
            BloodBank bloodBank,
            Donor donor,
            String reason,
            BloodBankSendBloodRequestDto request) {
        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setRequestGroupId(requestGroupId);
        bloodRequest.setRequesterType(RequesterType.BLOOD_BANK);
        bloodRequest.setBloodBank(bloodBank);
        bloodRequest.setDonor(donor);
        bloodRequest.setPatientName(request.getPatientName());
        bloodRequest.setPatientAge(0);
        bloodRequest.setPatientGender(Gender.OTHER);
        bloodRequest.setRequiredBloodGroup(request.getBloodType());
        bloodRequest.setUnitsOfBloodRequired(1);
        bloodRequest.setReasonForBloodRequirement(reason);
        bloodRequest.setHospitalName(
                bloodBank.getName() != null && !bloodBank.getName().isBlank() ? bloodBank.getName() : "Blood bank");
        bloodRequest.setHospitalAddress(
                bloodBank.getAddress() != null && !bloodBank.getAddress().isBlank() ? bloodBank.getAddress() : "N/A");
        bloodRequest.setHospitalCity(
                bloodBank.getCity() != null && !bloodBank.getCity().isBlank() ? bloodBank.getCity() : "N/A");
        bloodRequest.setHospitalPinCode(bloodBank.getPincode());
        bloodRequest.setContactPersonName(request.getContactPersonName());
        bloodRequest.setContactPhoneNumber(request.getContactPhoneNumber());
        bloodRequest.setEmergencyLevel(request.getEmergencyLevel());
        bloodRequest.setRequiredBeforeDateTime(request.getRequiredBeforeDateTime());
        bloodRequest.setStatus(BloodRequestStatus.PENDING);
        applyRequestCoordinates(bloodRequest, request.getLatitude(), request.getLongitude(), bloodBank);
        return bloodRequest;
    }

    private BloodBank findCurrentBloodBank() {
        Long bloodBankId = securityUtil.getCurrentUserId();
        return bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood bank not found"));
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

        expirePendingRequestsForUser(user.getId());

        syncLiveLocation(user, request.getLatitude(), request.getLongitude());

        String bloodGroup = user.getBloodType().getDisplayName();
        GeoCoordinates origin = resolveRequestOrigin(request.getLatitude(), request.getLongitude(), user);
        double radiusKm = request.getRadiusKm() != null
                ? request.getRadiusKm()
                : googleMapsProperties.getDefaultSearchRadiusKm();

        List<Donor> targetDonors = resolveTargetDonorsForUser(
                request, bloodGroup, origin, user.getPincode(), radiusKm);

        if (targetDonors.isEmpty()) {
            throw new BadRequestException("No eligible donors found nearby");
        }

        String requestGroupId = UUID.randomUUID().toString();
        List<BloodRequestResponse> responses = new ArrayList<>();

        for (Donor donor : targetDonors) {
            BloodRequest bloodRequest = buildUserBloodRequest(
                    requestGroupId, user, donor, reason, request);
            responses.add(bloodRequestMapper.toResponse(bloodRequestRepository.save(bloodRequest)));
        }

        return responses;
    }

    private List<Donor> resolveTargetDonorsForUser(
            UserSendBloodRequestDto request,
            String bloodGroup,
            GeoCoordinates origin,
            String pinCodeFallback,
            double radiusKm) {
        if (request.getDonorIds() != null && !request.getDonorIds().isEmpty()) {
            List<Long> uniqueIds = request.getDonorIds().stream().distinct().toList();
            List<Donor> selectedDonors = new ArrayList<>();
            for (Long donorId : uniqueIds) {
                if (!eligibleDonorFinder.isEligibleSelectedDonor(
                        bloodGroup, origin, pinCodeFallback, donorId, radiusKm)) {
                    throw new BadRequestException(
                            "Selected donor is not eligible within " + (int) radiusKm + " km radius");
                }
                Donor donor = donorRepository.findById(donorId)
                        .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
                selectedDonors.add(donor);
            }
            return selectedDonors;
        }

        return eligibleDonorFinder.findNearbyEligibleDonors(
                bloodGroup, origin, pinCodeFallback, radiusKm);
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
    public BloodRequestGroupSummaryResponse getRequestGroupSummaryForUser(String requestGroupId) {
        User user = findCurrentUser();
        List<BloodRequest> requests = bloodRequestRepository.findByRequestGroupId(requestGroupId);
        if (requests.isEmpty()) {
            throw new ResourceNotFoundException("Blood request group not found");
        }

        BloodRequest first = requests.get(0);
        if (first.getUser() == null || !first.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Blood request group not found");
        }

        int acceptedCount = 0;
        int pendingCount = 0;
        int rejectedCount = 0;
        int expiredCount = 0;
        List<AcceptedDonorLocationResponse> acceptedDonors = new ArrayList<>();

        for (BloodRequest request : requests) {
            switch (request.getStatus()) {
                case ACCEPTED, COMPLETED -> {
                    acceptedCount++;
                    Donor donor = request.getDonor();
                    acceptedDonors.add(AcceptedDonorLocationResponse.builder()
                            .donorId(donor.getId())
                            .donorName(donor.getName())
                            .bloodGroup(donor.getBloodType().getDisplayName())
                            .latitude(donor.getLatitude())
                            .longitude(donor.getLongitude())
                            .bloodRequestId(request.getId())
                            .acceptedAt(request.getRespondedAt())
                            .build());
                }
                case PENDING -> pendingCount++;
                case REJECTED -> rejectedCount++;
                case EXPIRED -> expiredCount++;
                default -> { }
            }
        }

        BloodRequestStatus groupStatus = acceptedCount > 0
                ? BloodRequestStatus.ACCEPTED
                : pendingCount > 0
                        ? BloodRequestStatus.PENDING
                        : BloodRequestStatus.EXPIRED;

        return BloodRequestGroupSummaryResponse.builder()
                .requestGroupId(requestGroupId)
                .totalSent(requests.size())
                .acceptedCount(acceptedCount)
                .pendingCount(pendingCount)
                .rejectedCount(rejectedCount)
                .expiredCount(expiredCount)
                .groupStatus(groupStatus)
                .requestLatitude(first.getRequestLatitude())
                .requestLongitude(first.getRequestLongitude())
                .createdAt(first.getCreatedAt())
                .acceptedDonors(acceptedDonors)
                .build();
    }

    @Override
    public List<BloodRequestResponse> listIncomingForDonor() {
        Donor donor = findCurrentDonor();
        return bloodRequestRepository.findByDonorIdOrderByCreatedAtDesc(donor.getId()).stream()
                .sorted(incomingRequestComparator(donor))
                .map(request -> bloodRequestMapper.toResponse(request, donor))
                .toList();
    }

    @Override
    @Transactional
    public BloodRequestResponse acceptRequest(Long requestId, LiveLocationRequest location) {
        if (location != null && location.getLatitude() != null && location.getLongitude() != null) {
            Donor donor = findCurrentDonor();
            donor.setLatitude(location.getLatitude());
            donor.setLongitude(location.getLongitude());
            donorRepository.save(donor);
        }

        BloodRequest request = findPendingRequestForDonor(requestId);
        return acceptPendingBloodRequest(request);
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
        bloodRequest.setContactPersonName(request.getContactPersonName());
        bloodRequest.setContactPhoneNumber(request.getContactPhoneNumber());
        bloodRequest.setEmergencyLevel(request.getEmergencyLevel());
        bloodRequest.setRequiredBeforeDateTime(request.getRequiredBeforeDateTime());
        bloodRequest.setStatus(BloodRequestStatus.PENDING);
        applyRequestCoordinates(bloodRequest, request.getLatitude(), request.getLongitude(), hospital);
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
        bloodRequest.setUnitsOfBloodRequired(1);
        bloodRequest.setReasonForBloodRequirement(reason);
        bloodRequest.setHospitalName(user.getName());
        bloodRequest.setHospitalAddress(
                user.getAddress() != null && !user.getAddress().isBlank() ? user.getAddress() : "N/A");
        bloodRequest.setHospitalCity("");
        bloodRequest.setHospitalPinCode(user.getPincode());
        bloodRequest.setContactPersonName(request.getContactPersonName());
        bloodRequest.setContactPhoneNumber(request.getContactPhoneNumber());
        bloodRequest.setEmergencyLevel(request.getEmergencyLevel());
        bloodRequest.setRequiredBeforeDateTime(request.getRequiredBeforeDateTime());
        bloodRequest.setStatus(BloodRequestStatus.PENDING);
        applyRequestCoordinates(bloodRequest, request.getLatitude(), request.getLongitude(), user);
        return bloodRequest;
    }

    private void expirePendingRequestsForUser(Long userId) {
        List<BloodRequest> pendingRequests = bloodRequestRepository.findByUserIdAndStatus(
                userId, BloodRequestStatus.PENDING);
        LocalDateTime now = LocalDateTime.now();

        for (BloodRequest pending : pendingRequests) {
            pending.setStatus(BloodRequestStatus.EXPIRED);
            pending.setRespondedAt(now);
            bloodRequestRepository.save(pending);
        }
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

    private BloodRequest findReceivedRoutingRequest(Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));

        if (request.getRequesterType() != RequesterType.USER
                && request.getRequesterType() != RequesterType.HOSPITAL) {
            throw new BadRequestException("Only user or hospital routing requests can be processed here");
        }
        if (request.getStatus() != BloodRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be accepted or rejected");
        }
        return request;
    }

    private BloodRequestResponse acceptPendingBloodRequest(BloodRequest request) {
        request.setStatus(BloodRequestStatus.ACCEPTED);
        request.setRespondedAt(LocalDateTime.now());

        Donor acceptingDonor = request.getDonor();
        if (acceptingDonor != null) {
            acceptingDonor.setLastDonationDate(LocalDate.now());
            donorRepository.save(acceptingDonor);
        }

        expireOtherPendingInGroup(request.getRequestGroupId(), request.getId());

        Patient patient = request.getPatient();
        if (patient != null) {
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

    private void rejectPendingGroup(String requestGroupId) {
        List<BloodRequest> pendingInGroup = bloodRequestRepository.findByRequestGroupIdAndStatus(
                requestGroupId, BloodRequestStatus.PENDING);
        LocalDateTime now = LocalDateTime.now();

        for (BloodRequest pending : pendingInGroup) {
            pending.setStatus(BloodRequestStatus.REJECTED);
            pending.setRespondedAt(now);
            bloodRequestRepository.save(pending);
        }
    }

    private GeoCoordinates resolveRequestOrigin(Double dtoLatitude, Double dtoLongitude, BaseAccount account) {
        if (dtoLatitude != null && dtoLongitude != null) {
            GeoCoordinates coordinates = new GeoCoordinates(dtoLatitude, dtoLongitude);
            if (coordinates.isValid()) {
                return coordinates;
            }
        }
        if (account.getLatitude() != null && account.getLongitude() != null) {
            GeoCoordinates coordinates = new GeoCoordinates(account.getLatitude(), account.getLongitude());
            if (coordinates.isValid()) {
                return coordinates;
            }
        }
        return null;
    }

    private void applyRequestCoordinates(
            BloodRequest bloodRequest,
            Double dtoLatitude,
            Double dtoLongitude,
            BaseAccount account) {
        Double latitude = dtoLatitude != null ? dtoLatitude : account.getLatitude();
        Double longitude = dtoLongitude != null ? dtoLongitude : account.getLongitude();
        bloodRequest.setRequestLatitude(latitude);
        bloodRequest.setRequestLongitude(longitude);
    }

    private void syncLiveLocation(BaseAccount account, Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return;
        }
        account.setLatitude(latitude);
        account.setLongitude(longitude);
        if (account instanceof User user) {
            userRepository.save(user);
        } else if (account instanceof Donor donor) {
            donorRepository.save(donor);
        } else if (account instanceof Hospital hospital) {
            hospitalRepository.save(hospital);
        } else if (account instanceof BloodBank bloodBank) {
            bloodBankRepository.save(bloodBank);
        }
    }

    private Comparator<BloodRequest> incomingRequestComparator(Donor donor) {
        return Comparator
                .comparing((BloodRequest request) -> request.getStatus() != BloodRequestStatus.PENDING)
                .thenComparing(request -> distanceForSort(request, donor), Comparator.nullsLast(Double::compareTo))
                .thenComparing(BloodRequest::getCreatedAt, Comparator.reverseOrder());
    }

    private Double distanceForSort(BloodRequest request, Donor donor) {
        if (request.getRequestLatitude() == null
                || request.getRequestLongitude() == null
                || donor.getLatitude() == null
                || donor.getLongitude() == null) {
            return null;
        }
        return GeoDistanceUtil.haversineKm(
                donor.getLatitude(),
                donor.getLongitude(),
                request.getRequestLatitude(),
                request.getRequestLongitude());
    }

    private Donor findCurrentDonor() {
        Long donorId = securityUtil.getCurrentUserId();
        return donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
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
