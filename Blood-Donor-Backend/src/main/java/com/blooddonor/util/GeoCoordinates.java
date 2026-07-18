package com.blooddonor.util;

public record GeoCoordinates(double latitude, double longitude) {

    public boolean isValid() {
        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }
}
