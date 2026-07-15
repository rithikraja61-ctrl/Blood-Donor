package com.blooddonor.util;

import com.blooddonor.validation.DistancePriority;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class PincodeProximityUtil {

    // Temporary hardcoded nearby map — replace later with PIN→City API
    private static final Map<String, List<String>> NEARBY_PINCODES = Map.of(
        "641001", List.of("641002", "641003", "641004", "641005"),
        "641002", List.of("641001", "641003", "641004"),
        "600001", List.of("600002", "600003", "600004")
    );

    private PincodeProximityUtil() {}

    public static DistancePriority getDistancePriority(String searchPin, String donorPin) {
        if (searchPin.equals(donorPin)) {
            return DistancePriority.SAME_PIN;
        }

        List<String> nearby = NEARBY_PINCODES.getOrDefault(searchPin, List.of());
        if (nearby.contains(donorPin)) {
            return DistancePriority.NEARBY_PIN;
        }

        // Fallback: Indian PIN prefix rules
        if (searchPin.length() >= 3 && donorPin.length() >= 3
                && searchPin.substring(0, 3).equals(donorPin.substring(0, 3))) {
            return DistancePriority.NEARBY_PIN;
        }

        return DistancePriority.FAR_PIN;
    }

    public static int getDistanceRank(DistancePriority priority) {
        return switch (priority) {
            case SAME_PIN -> 0;
            case NEARBY_PIN -> 1;
            case FAR_PIN -> 2;
        };
    }

    public static Set<String> getSearchPinPrefixes(String searchPin) {
        // Used to widen DB query when not enough donors found
        return Set.of(
            searchPin,
            searchPin.substring(0, Math.min(3, searchPin.length())),
            searchPin.substring(0, Math.min(2, searchPin.length()))
        );
    }
}