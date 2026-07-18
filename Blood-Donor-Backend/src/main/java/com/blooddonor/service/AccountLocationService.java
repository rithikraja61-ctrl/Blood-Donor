package com.blooddonor.service;

import com.blooddonor.entity.BaseAccount;
import com.blooddonor.util.GeoCoordinates;
import org.springframework.stereotype.Service;

@Service
public class AccountLocationService {

    private final GeocodingService geocodingService;

    public AccountLocationService(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    public void applyLocation(
            BaseAccount account,
            Double latitude,
            Double longitude,
            String addressLine,
            String city,
            String state,
            String pincode) {
        if (latitude != null && longitude != null) {
            account.setLatitude(latitude);
            account.setLongitude(longitude);
            return;
        }

        String query = buildAddressQuery(addressLine, city, state, pincode);
        if (query.isBlank()) {
            return;
        }

        try {
            GeoCoordinates coordinates = geocodingService.geocodeAddress(query);
            account.setLatitude(coordinates.latitude());
            account.setLongitude(coordinates.longitude());
        } catch (RuntimeException ignored) {
            // Keep nullable coordinates; pincode fallback remains available for search.
        }
    }

    public GeoCoordinates resolveSearchOrigin(
            Double latitude,
            Double longitude,
            String pinCode,
            String addressLine,
            String city,
            String state) {
        if (latitude != null && longitude != null) {
            GeoCoordinates coordinates = new GeoCoordinates(latitude, longitude);
            if (coordinates.isValid()) {
                return coordinates;
            }
        }

        if (pinCode != null && !pinCode.isBlank()) {
            String query = buildAddressQuery(addressLine, city, state, pinCode);
            if (!query.isBlank()) {
                try {
                    return geocodingService.geocodeAddress(query);
                } catch (RuntimeException ignored) {
                    // fall through
                }
            }
        }

        return null;
    }

    private String buildAddressQuery(String addressLine, String city, String state, String pincode) {
        StringBuilder builder = new StringBuilder();
        appendPart(builder, addressLine);
        appendPart(builder, city);
        appendPart(builder, state);
        appendPart(builder, pincode);
        appendPart(builder, "India");
        return builder.toString().trim();
    }

    private void appendPart(StringBuilder builder, String part) {
        if (part != null && !part.isBlank()) {
            if (!builder.isEmpty()) {
                builder.append(", ");
            }
            builder.append(part.trim());
        }
    }
}
