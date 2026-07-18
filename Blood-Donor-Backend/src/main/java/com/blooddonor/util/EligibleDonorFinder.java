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

    public List<RankedDonor> findRankedEligibleDonors(
            String bloodGroup,
            GeoCoordinates searchOrigin,
            String pinCodeFallback,
            double radiusKm) {
        BloodType requiredType = BloodType.fromDisplay(bloodGroup);
        List<BloodType> compatibleTypes = BloodCompatibilityUtil.getCompatibleTypesInPriorityOrder(requiredType);
        LocalDate cutoffDate = LocalDate.now().minusDays(DONATION_COOLDOWN_DAYS);

        List<Donor> allEligible = donorRepository.findEligibleDonors(compatibleTypes, cutoffDate);
        if (allEligible.isEmpty()) {
            return List.of();
        }

        if (searchOrigin != null && searchOrigin.isValid()) {
            return rankByCoordinates(allEligible, requiredType, searchOrigin, radiusKm);
        }

        if (pinCodeFallback != null && !pinCodeFallback.isBlank()) {
            return rankByPincode(allEligible, requiredType, pinCodeFallback);
        }

        return List.of();
    }

    public List<Donor> findSortedEligibleDonors(String bloodGroup, String pinCode) {
        return findRankedEligibleDonors(bloodGroup, null, pinCode, Double.MAX_VALUE).stream()
                .map(RankedDonor::donor)
                .toList();
    }

    public List<Donor> findNearbyEligibleDonors(String bloodGroup, String pinCode) {
        return findNearbyEligibleDonors(bloodGroup, null, pinCode, Double.MAX_VALUE);
    }

    public List<Donor> findNearbyEligibleDonors(
            String bloodGroup,
            GeoCoordinates searchOrigin,
            String pinCodeFallback,
            double radiusKm) {
        double effectiveRadius = searchOrigin != null && searchOrigin.isValid()
                ? radiusKm
                : Double.MAX_VALUE;
        List<RankedDonor> rankedDonors = findRankedEligibleDonors(
                bloodGroup, searchOrigin, pinCodeFallback, effectiveRadius);

        if (searchOrigin != null && searchOrigin.isValid()) {
            return rankedDonors.stream().map(RankedDonor::donor).toList();
        }

        return rankedDonors.stream()
                .filter(ranked -> PincodeProximityUtil.getDistancePriority(
                        pinCodeFallback, ranked.donor().getPincode()) != DistancePriority.FAR_PIN)
                .map(RankedDonor::donor)
                .toList();
    }

    public boolean isEligibleSelectedDonor(
            String bloodGroup,
            GeoCoordinates searchOrigin,
            String pinCodeFallback,
            Long donorId,
            double radiusKm) {
        if (donorId == null) {
            return false;
        }
        return findRankedEligibleDonors(bloodGroup, searchOrigin, pinCodeFallback, radiusKm).stream()
                .anyMatch(ranked -> ranked.donor().getId().equals(donorId));
    }

    private List<RankedDonor> rankByCoordinates(
            List<Donor> donors,
            BloodType requiredType,
            GeoCoordinates searchOrigin,
            double radiusKm) {
        List<RankedDonor> ranked = new ArrayList<>();

        for (Donor donor : donors) {
            if (donor.getLatitude() == null || donor.getLongitude() == null) {
                continue;
            }
            double distanceKm = GeoDistanceUtil.haversineKm(
                    searchOrigin.latitude(),
                    searchOrigin.longitude(),
                    donor.getLatitude(),
                    donor.getLongitude());
            if (distanceKm <= radiusKm) {
                ranked.add(RankedDonor.of(donor, distanceKm));
            }
        }

        return ranked.stream()
                .sorted(Comparator
                        .comparingDouble(RankedDonor::distanceKm)
                        .thenComparingInt(r -> BloodCompatibilityUtil.getBloodPriority(requiredType, r.bloodType()))
                        .thenComparing(r -> r.donor().getLastDonationDate(), Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(r -> r.donor().getId()))
                .toList();
    }

    private List<RankedDonor> rankByPincode(List<Donor> donors, BloodType requiredType, String pinCode) {
        List<Donor> samePinDonors = donors.stream()
                .filter(d -> d.getPincode().equals(pinCode))
                .toList();

        List<Donor> resultPool = new ArrayList<>(samePinDonors);
        if (resultPool.size() < MIN_DONORS) {
            donors.stream()
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
                .map(donor -> {
                    double pseudoDistance = PincodeProximityUtil.getDistanceRank(
                            PincodeProximityUtil.getDistancePriority(pinCode, donor.getPincode()));
                    return RankedDonor.of(donor, pseudoDistance);
                })
                .toList();
    }
}
