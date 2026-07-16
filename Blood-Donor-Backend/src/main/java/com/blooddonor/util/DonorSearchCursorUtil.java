package com.blooddonor.util;

import com.blooddonor.exception.BadRequestException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public final class DonorSearchCursorUtil {

    private DonorSearchCursorUtil() {}

    public static String encode(Long donorId) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(donorId.toString().getBytes(StandardCharsets.UTF_8));
    }

    public static Long decode(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            throw new BadRequestException("Cursor must not be blank");
        }

        try {
            byte[] decoded = Base64.getUrlDecoder().decode(cursor.trim());
            return Long.parseLong(new String(decoded, StandardCharsets.UTF_8));
        } catch (RuntimeException ex) {
            throw new BadRequestException("Invalid cursor");
        }
    }
}
