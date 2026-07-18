package com.blooddonor.util;

import java.time.LocalDate;

public final class BloodInventoryDefaults {

    public static final int DEFAULT_SHELF_LIFE_DAYS = 42;

    private BloodInventoryDefaults() {
    }

    public static LocalDate defaultExpiryDate() {
        return LocalDate.now().plusDays(DEFAULT_SHELF_LIFE_DAYS);
    }
}
