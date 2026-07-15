package com.blooddonor.validation;

import com.blooddonor.exception.BadRequestException;

public enum BloodType {
    A_POSITIVE,
    A_NEGATIVE,
    B_POSITIVE,
    B_NEGATIVE,
    AB_POSITIVE,
    AB_NEGATIVE,
    O_POSITIVE,
    O_NEGATIVE;

    public String getDisplayName() {
        return switch (this) {
            case A_POSITIVE -> "A+";
            case A_NEGATIVE -> "A-";
            case B_POSITIVE -> "B+";
            case B_NEGATIVE -> "B-";
            case AB_POSITIVE -> "AB+";
            case AB_NEGATIVE -> "AB-";
            case O_POSITIVE -> "O+";
            case O_NEGATIVE -> "O-";
        };
    }

    public static BloodType fromDisplay(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Blood group is required");
        }

        return switch (value.trim().toUpperCase()) {
            case "A+", "A_POSITIVE" -> A_POSITIVE;
            case "A-", "A_NEGATIVE" -> A_NEGATIVE;
            case "B+", "B_POSITIVE" -> B_POSITIVE;
            case "B-", "B_NEGATIVE" -> B_NEGATIVE;
            case "AB+", "AB_POSITIVE" -> AB_POSITIVE;
            case "AB-", "AB_NEGATIVE" -> AB_NEGATIVE;
            case "O+", "O_POSITIVE" -> O_POSITIVE;
            case "O-", "O_NEGATIVE" -> O_NEGATIVE;
            default -> throw new BadRequestException("Invalid blood group: " + value);
        };
    }
}
