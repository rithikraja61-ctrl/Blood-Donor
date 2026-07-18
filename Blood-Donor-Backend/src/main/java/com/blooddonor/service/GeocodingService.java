package com.blooddonor.service;

import com.blooddonor.util.GeoCoordinates;
import com.blooddonor.util.GeocodedAddress;
import org.springframework.stereotype.Service;

@Service
public class GeocodingService {

    private final GoogleGeocodingService googleGeocodingService;
    private final OpenStreetMapGeocodingService openStreetMapGeocodingService;

    public GeocodingService(
            GoogleGeocodingService googleGeocodingService,
            OpenStreetMapGeocodingService openStreetMapGeocodingService) {
        this.googleGeocodingService = googleGeocodingService;
        this.openStreetMapGeocodingService = openStreetMapGeocodingService;
    }

    public GeoCoordinates geocodeAddress(String addressLine) {
        try {
            GeocodedAddress geocoded = openStreetMapGeocodingService.geocodeSearchQuery(addressLine);
            return new GeoCoordinates(geocoded.latitude(), geocoded.longitude());
        } catch (RuntimeException ex) {
            return googleGeocodingService.geocodeAddress(addressLine);
        }
    }

    public GeocodedAddress reverseGeocode(double latitude, double longitude) {
        try {
            return openStreetMapGeocodingService.reverseGeocode(latitude, longitude);
        } catch (RuntimeException ex) {
            return googleGeocodingService.reverseGeocode(latitude, longitude);
        }
    }

    public GeocodedAddress geocodeSearchQuery(String query) {
        try {
            return openStreetMapGeocodingService.geocodeSearchQuery(query);
        } catch (RuntimeException ex) {
            return googleGeocodingService.geocodeSearchQuery(query);
        }
    }
}
