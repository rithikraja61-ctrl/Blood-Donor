package com.blooddonor.service.impl;

import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.dto.response.DonorSearchResponse;
import com.blooddonor.dto.response.PagedDonorSearchResponse;
import com.blooddonor.entity.Donor;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.DonorMapper;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.service.DonorService;
import com.blooddonor.util.BloodCompatibilityUtil;
import com.blooddonor.util.PincodeProximityUtil;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DonorServiceImpl implements DonorService {

    private static final int MIN_DONORS = 5;
    private static final int DONATION_COOLDOWN_DAYS = 90;

    private final DonorRepository donorRepository;
    private final DonorMapper donorMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    public DonorServiceImpl(
            DonorRepository donorRepository,
            DonorMapper donorMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder) {
        this.donorRepository = donorRepository;
        this.donorMapper = donorMapper;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public DonorResponse getProfile() {
        Donor donor = findCurrentDonor();
        return donorMapper.toResponse(donor);
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
    public PagedDonorSearchResponse searchDonors(String bloodGroup, String pinCode, Pageable pageable) {
        BloodType requiredType = BloodType.fromDisplay(bloodGroup);
        List<BloodType> compatibleTypes = BloodCompatibilityUtil.getCompatibleTypesInPriorityOrder(requiredType);
        LocalDate cutoffDate = LocalDate.now().minusDays(DONATION_COOLDOWN_DAYS);

        List<Donor> allEligible = donorRepository.findEligibleDonors(compatibleTypes, cutoffDate);

        List<Donor> samePinDonors = allEligible.stream()
                .filter(d -> d.getPincode().equals(pinCode))
                .toList();

        List<Donor> resultPool = new ArrayList<>(samePinDonors);

        if (resultPool.size() < MIN_DONORS) {
            allEligible.stream()
                    .filter(d -> !d.getPincode().equals(pinCode))
                    .forEach(resultPool::add);
        }

        List<DonorSearchResponse> sortedResults = resultPool.stream()
                .sorted(Comparator
                        .comparingInt((Donor d) -> PincodeProximityUtil.getDistanceRank(
                                PincodeProximityUtil.getDistancePriority(pinCode, d.getPincode())))
                        .thenComparingInt(d -> BloodCompatibilityUtil.getBloodPriority(requiredType, d.getBloodType()))
                        .thenComparing(Donor::getLastDonationDate, Comparator.nullsFirst(Comparator.naturalOrder())))
                .map(donor -> toSearchResponse(donor, pinCode))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sortedResults.size());
        List<DonorSearchResponse> pageContent =
                start >= sortedResults.size() ? List.of() : sortedResults.subList(start, end);

        Page<DonorSearchResponse> page = new PageImpl<>(pageContent, pageable, sortedResults.size());
        return PagedDonorSearchResponse.from(page);
    }

    private DonorSearchResponse toSearchResponse(Donor donor, String searchPin) {
        return DonorSearchResponse.builder()
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
