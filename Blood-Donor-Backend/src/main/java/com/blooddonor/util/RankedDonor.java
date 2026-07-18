package com.blooddonor.util;

import com.blooddonor.entity.Donor;
import com.blooddonor.validation.BloodType;

public record RankedDonor(Donor donor, double distanceKm) {

    public static RankedDonor of(Donor donor, double distanceKm) {
        return new RankedDonor(donor, distanceKm);
    }

    public BloodType bloodType() {
        return donor.getBloodType();
    }

    public Long id() {
        return donor.getId();
    }
}
