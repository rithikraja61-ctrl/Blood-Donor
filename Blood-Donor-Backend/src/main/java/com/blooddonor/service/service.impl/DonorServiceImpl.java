package com.blooddonor.service.impl;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.CursorDonorSearchResponse;
import com.blooddonor.dto.response.DonorDashboardResponse;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.dto.response.DonorSearchResponse;
import com.blooddonor.entity.Donor;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.DonorMapper;
import com.blooddonor.repository.BloodRequestRepository;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.service.DonorService;
import com.blooddonor.util.DonorSearchCursorUtil;
import com.blooddonor.util.EligibleDonorFinder;
import com.blooddonor.util.PincodeProximityUtil;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodRequestStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonorServiceImpl implements DonorService {

    private final DonorRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final DonorMapper donorMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;
    private final EligibleDonorFinder eligibleDonorFinder;

    public DonorServiceImpl(
            DonorRepository donorRepository,
            BloodRequestRepository bloodRequestRepository,
            DonorMapper donorMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder,
            EligibleDonorFinder eligibleDonorFinder) {
        this.donorRepository = donorRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.donorMapper = donorMapper;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
        this.eligibleDonorFinder = eligibleDonorFinder;
    }

    @Override
    public DonorResponse getProfile() {
        Donor donor = findCurrentDonor();
        return donorMapper.toResponse(donor);
    }

    @Override
    public DonorDashboardResponse getDashboard() {
        Donor donor = findCurrentDonor();
        Long donorId = donor.getId();

        long totalDonationsMade = bloodRequestRepository.countByDonorIdAndStatusIn(
                donorId,
                List.of(BloodRequestStatus.COMPLETED, BloodRequestStatus.ACCEPTED));
        long pendingRequestsCount = bloodRequestRepository.countByDonorIdAndStatus(
                donorId, BloodRequestStatus.PENDING);

        return DonorDashboardResponse.builder()
                .donorName(donor.getName())
                .bloodGroupDisplay(donor.getBloodType().getDisplayName())
                .lastDonationDate(donor.getLastDonationDate())
                .totalDonationsMade(totalDonationsMade)
                .pendingRequestsCount(pendingRequestsCount)
                .build();
    }

    @Override
    public DonorResponse updateProfile(DonorUpdateRequest request) {
        Donor donor = findCurrentDonor();
        donorMapper.updateEntity(donor, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            donor.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Donor updatedDonor = donorRepository.save(donor);
        return donorMapper.toResponse(updatedDonor);
    }

    @Override
    public void deleteAccount() {
        Donor donor = findCurrentDonor();
        donorRepository.delete(donor);
    }

    @Override
    public CursorDonorSearchResponse searchDonors(
            String bloodGroup,
            String pinCode,
            int limit,
            String nextCursor,
            String previousCursor) {
        List<Donor> sortedDonors = findSortedEligibleDonors(bloodGroup, pinCode);
        return paginateWithCursor(sortedDonors, pinCode, limit, nextCursor, previousCursor);
    }

    private List<Donor> findSortedEligibleDonors(String bloodGroup, String pinCode) {
        return eligibleDonorFinder.findSortedEligibleDonors(bloodGroup, pinCode);
    }

    private CursorDonorSearchResponse paginateWithCursor(
            List<Donor> sortedDonors,
            String searchPin,
            int limit,
            String nextCursor,
            String previousCursor) {
        boolean hasNextCursor = nextCursor != null && !nextCursor.isBlank();
        boolean hasPreviousCursor = previousCursor != null && !previousCursor.isBlank();

        if (hasNextCursor && hasPreviousCursor) {
            throw new BadRequestException("Provide either nextCursor or previousCursor, not both");
        }

        int total = sortedDonors.size();
        int startIndex;
        int endIndex;

        if (hasNextCursor) {
            int cursorIndex = indexOfDonor(sortedDonors, DonorSearchCursorUtil.decode(nextCursor));
            startIndex = cursorIndex + 1;
            endIndex = Math.min(startIndex + limit, total);
        } else if (hasPreviousCursor) {
            int cursorIndex = indexOfDonor(sortedDonors, DonorSearchCursorUtil.decode(previousCursor));
            endIndex = cursorIndex;
            startIndex = Math.max(0, endIndex - limit);
        } else {
            startIndex = 0;
            endIndex = Math.min(limit, total);
        }

        List<Donor> pageDonors = (startIndex >= total || startIndex >= endIndex)
                ? List.of()
                : sortedDonors.subList(startIndex, endIndex);

        List<DonorSearchResponse> content = pageDonors.stream()
                .map(donor -> toSearchResponse(donor, searchPin))
                .toList();

        boolean hasNext = endIndex < total;
        boolean hasPrevious = startIndex > 0;

        String responseNextCursor = hasNext && !pageDonors.isEmpty()
                ? DonorSearchCursorUtil.encode(pageDonors.get(pageDonors.size() - 1).getId())
                : null;
        String responsePreviousCursor = hasPrevious && !pageDonors.isEmpty()
                ? DonorSearchCursorUtil.encode(pageDonors.get(0).getId())
                : null;

        return CursorDonorSearchResponse.builder()
                .content(content)
                .nextCursor(responseNextCursor)
                .previousCursor(responsePreviousCursor)
                .build();
    }

    private int indexOfDonor(List<Donor> donors, Long donorId) {
        for (int i = 0; i < donors.size(); i++) {
            if (donors.get(i).getId().equals(donorId)) {
                return i;
            }
        }
        throw new BadRequestException("Invalid or expired cursor");
    }

    private DonorSearchResponse toSearchResponse(Donor donor, String searchPin) {
        return DonorSearchResponse.builder()
                .id(donor.getId())
                .name(donor.getName())
                .bloodGroup(donor.getBloodType().getDisplayName())
                .city(donor.getCity())
                .pinCode(donor.getPincode())
                .distancePriority(PincodeProximityUtil.getDistancePriority(searchPin, donor.getPincode()))
                .phoneNumber(donor.getPhoneNumber())
                .lastDonationDate(donor.getLastDonationDate())
                .availabilityStatus(donor.isAvailable())
                .build();
    }

    private Donor findCurrentDonor() {
        Long donorId = securityUtil.getCurrentUserId();
        return donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
    }
}
