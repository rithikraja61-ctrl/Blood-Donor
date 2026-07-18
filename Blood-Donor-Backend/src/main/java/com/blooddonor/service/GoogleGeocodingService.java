package com.blooddonor.service;

import com.blooddonor.config.GoogleMapsProperties;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.util.GeoCoordinates;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GoogleGeocodingService {

    private static final Pattern STATUS_PATTERN = Pattern.compile("\"status\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern LAT_PATTERN = Pattern.compile("\"lat\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)");
    private static final Pattern LNG_PATTERN = Pattern.compile("\"lng\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)");

    private final GoogleMapsProperties googleMapsProperties;
    private final RestClient restClient;

    public GoogleGeocodingService(GoogleMapsProperties googleMapsProperties) {
        this.googleMapsProperties = googleMapsProperties;
        this.restClient = RestClient.create();
    }

    public GeoCoordinates geocodeAddress(String addressLine) {
        if (addressLine == null || addressLine.isBlank()) {
            throw new BadRequestException("Address is required for geocoding");
        }

        String apiKey = googleMapsProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Google Geocoding API key is not configured on the server");
        }

        String uri = UriComponentsBuilder
                .fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("address", addressLine)
                .queryParam("region", "in")
                .queryParam("key", apiKey)
                .build()
                .encode()
                .toUriString();

        String body = restClient.get()
                .uri(uri)
                .retrieve()
                .body(String.class);

        if (body == null || body.isBlank()) {
            throw new BadRequestException("Unable to geocode address: NO_RESPONSE");
        }

        String status = "UNKNOWN";
        Matcher statusMatcher = STATUS_PATTERN.matcher(body);
        if (statusMatcher.find()) {
            status = statusMatcher.group(1);
        }
        if (!"OK".equals(status)) {
            throw new BadRequestException("Unable to geocode address: " + status);
        }

        Matcher latMatcher = LAT_PATTERN.matcher(body);
        Matcher lngMatcher = LNG_PATTERN.matcher(body);
        if (!latMatcher.find() || !lngMatcher.find()) {
            throw new BadRequestException("Unable to geocode address: INVALID_RESPONSE");
        }

        return new GeoCoordinates(
                Double.parseDouble(latMatcher.group(1)),
                Double.parseDouble(lngMatcher.group(1)));
    }
}
