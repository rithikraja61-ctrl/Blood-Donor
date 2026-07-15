package com.blooddonor.util;

import com.blooddonor.validation.BloodType;
import java.util.List;
import java.util.Map;

public final class BloodCompatibilityUtil {

    private static final Map<BloodType, List<BloodType>> COMPATIBILITY_ORDER = Map.of(
        BloodType.A_POSITIVE, List.of(BloodType.A_POSITIVE, BloodType.A_NEGATIVE, BloodType.O_POSITIVE, BloodType.O_NEGATIVE),
        BloodType.A_NEGATIVE, List.of(BloodType.A_NEGATIVE, BloodType.O_NEGATIVE),
        BloodType.B_POSITIVE, List.of(BloodType.B_POSITIVE, BloodType.B_NEGATIVE, BloodType.O_POSITIVE, BloodType.O_NEGATIVE),
        BloodType.B_NEGATIVE, List.of(BloodType.B_NEGATIVE, BloodType.O_NEGATIVE),
        BloodType.AB_POSITIVE, List.of(
            BloodType.AB_POSITIVE, BloodType.AB_NEGATIVE,
            BloodType.A_POSITIVE, BloodType.A_NEGATIVE,
            BloodType.B_POSITIVE, BloodType.B_NEGATIVE,
            BloodType.O_POSITIVE, BloodType.O_NEGATIVE
        ),
        BloodType.AB_NEGATIVE, List.of(BloodType.AB_NEGATIVE, BloodType.A_NEGATIVE, BloodType.B_NEGATIVE, BloodType.O_NEGATIVE),
        BloodType.O_POSITIVE, List.of(BloodType.O_POSITIVE, BloodType.O_NEGATIVE),
        BloodType.O_NEGATIVE, List.of(BloodType.O_NEGATIVE)
    );

    private BloodCompatibilityUtil() {}

    public static List<BloodType> getCompatibleTypesInPriorityOrder(BloodType required) {
        return COMPATIBILITY_ORDER.get(required);
    }

    public static int getBloodPriority(BloodType required, BloodType donorType) {
        List<BloodType> order = getCompatibleTypesInPriorityOrder(required);
        return order.indexOf(donorType); // lower = higher priority
    }
}