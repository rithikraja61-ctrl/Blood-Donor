package com.blooddonor.util;

public record GeocodedAddress(
        double latitude,
        double longitude,
        String address,
        String city,
        String state,
        String pincode,
        String formattedAddress) {
}
