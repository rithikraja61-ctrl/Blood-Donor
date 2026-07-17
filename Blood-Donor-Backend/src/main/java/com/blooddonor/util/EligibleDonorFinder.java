package com.blooddonor.util;

import com.blooddonor.entity.Donor;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.DistancePriority;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class EligibleDonorFinder {

    private static final int MIN_DONORS = 5;
    private static final int DONATION_COOLDOWN_DAYS = 90;

    private final DonorRepository donorRepository;

    public EligibleDonorFinder(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    public List<Donor> findSortedEligibleDonors(String bloodGroup, String pinCode) {
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

        return resultPool.stream()
                .sorted(Comparator
                        .comparingInt((Donor d) -> PincodeProximityUtil.getDistanceRank(
                                PincodeProximityUtil.getDistancePriority(pinCode, d.getPincode())))
                        .thenComparingInt(d -> BloodCompatibilityUtil.getBloodPriority(requiredType, d.getBloodType()))
                        .thenComparing(Donor::getLastDonationDate, Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(Donor::getId))
                .toList();
    }

    public List<Donor> findNearbyEligibleDonors(String bloodGroup, String pinCode) {
        return findSortedEligibleDonors(bloodGroup, pinCode).stream()
                .filter(d -> PincodeProximityUtil.getDistancePriority(pinCode, d.getPincode())
                        != DistancePriority.FAR_PIN)
                .toList();
    }
}
