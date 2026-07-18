package com.blooddonor.service;

import com.blooddonor.config.GoogleMapsProperties;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.util.GeoCoordinates;
import com.blooddonor.util.GeocodedAddress;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GoogleGeocodingService {

    private static final Pattern STATUS_PATTERN = Pattern.compile("\"status\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern FORMATTED_ADDRESS_PATTERN =
            Pattern.compile("\"formatted_address\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");
    private static final Pattern LAT_PATTERN = Pattern.compile("\"lat\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)");
    private static final Pattern LNG_PATTERN = Pattern.compile("\"lng\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)");
    private static final Pattern COMPONENT_PATTERN = Pattern.compile(
            "\\{\\s*\"long_name\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"\\s*,\\s*\"short_name\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"\\s*,\\s*\"types\"\\s*:\\s*\\[(.*?)\\]\\s*\\}",
            Pattern.DOTALL);

    private final GoogleMapsProperties googleMapsProperties;
    private final RestClient restClient;

    public GoogleGeocodingService(GoogleMapsProperties googleMapsProperties) {
        this.googleMapsProperties = googleMapsProperties;
        this.restClient = RestClient.create();
    }

    public GeoCoordinates geocodeAddress(String addressLine) {
        GeocodedAddress geocoded = geocodeSearchQuery(addressLine);
        return new GeoCoordinates(geocoded.latitude(), geocoded.longitude());
    }

    public GeocodedAddress reverseGeocode(double latitude, double longitude) {
        String uri = UriComponentsBuilder
                .fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("latlng", latitude + "," + longitude)
                .queryParam("region", "in")
                .queryParam("key", requireApiKey())
                .build()
                .encode()
                .toUriString();
        return parseGeocodeResponse(fetchBody(uri));
    }

    public GeocodedAddress geocodeSearchQuery(String query) {
        if (query == null || query.isBlank()) {
            throw new BadRequestException("Search query is required for geocoding");
        }

        String normalizedQuery = query.matches("^[0-9]{6}$") ? query + ", India" : query;

        String uri = UriComponentsBuilder
                .fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("address", normalizedQuery)
                .queryParam("region", "in")
                .queryParam("components", "country:IN")
                .queryParam("key", requireApiKey())
                .build()
                .encode()
                .toUriString();
        return parseGeocodeResponse(fetchBody(uri));
    }

    private String requireApiKey() {
        String apiKey = googleMapsProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Google Geocoding API key is not configured on the server");
        }
        return apiKey;
    }

    private String fetchBody(String uri) {
        String body = restClient.get()
                .uri(uri)
                .retrieve()
                .body(String.class);

        if (body == null || body.isBlank()) {
            throw new BadRequestException("Unable to geocode location: NO_RESPONSE");
        }
        return body;
    }

    private GeocodedAddress parseGeocodeResponse(String body) {
        String status = "UNKNOWN";
        Matcher statusMatcher = STATUS_PATTERN.matcher(body);
        if (statusMatcher.find()) {
            status = statusMatcher.group(1);
        }
        if (!"OK".equals(status)) {
            throw new BadRequestException("Unable to geocode location: " + status);
        }

        Matcher latMatcher = LAT_PATTERN.matcher(body);
        Matcher lngMatcher = LNG_PATTERN.matcher(body);
        if (!latMatcher.find() || !lngMatcher.find()) {
            throw new BadRequestException("Unable to geocode location: INVALID_RESPONSE");
        }

        double lat = Double.parseDouble(latMatcher.group(1));
        double lng = Double.parseDouble(lngMatcher.group(1));

        String formattedAddress = "";
        Matcher formattedMatcher = FORMATTED_ADDRESS_PATTERN.matcher(body);
        if (formattedMatcher.find()) {
            formattedAddress = unescapeJson(formattedMatcher.group(1));
        }

        String street = joinUnique(
                extractComponent(body, "subpremise"),
                extractComponent(body, "premise"),
                extractComponent(body, "street_number"),
                extractComponent(body, "route"),
                extractComponent(body, "neighborhood"),
                extractComponent(body, "sublocality_level_1"),
                extractComponent(body, "sublocality"));
        String city = firstNonBlank(
                extractComponent(body, "locality"),
                extractComponent(body, "postal_town"),
                extractComponent(body, "administrative_area_level_3"),
                extractComponent(body, "administrative_area_level_2"));
        String state = extractComponent(body, "administrative_area_level_1");
        String pincode = extractComponent(body, "postal_code");

        String address = street;
        if (address.isBlank() && !formattedAddress.isBlank()) {
            address = formattedAddress.split(",")[0].trim();
        }

        if (formattedAddress.isBlank()) {
            formattedAddress = joinUnique(address, city, state, pincode);
        }

        return new GeocodedAddress(lat, lng, address, city, state, pincode, formattedAddress);
    }

    private String extractComponent(String body, String type) {
        Matcher matcher = COMPONENT_PATTERN.matcher(body);
        while (matcher.find()) {
            String types = matcher.group(3);
            if (types.contains("\"" + type + "\"")) {
                return unescapeJson(matcher.group(1));
            }
        }
        return "";
    }

    private String unescapeJson(String value) {
        return value.replace("\\\"", "\"").replace("\\\\", "\\");
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String joinUnique(String... parts) {
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) {
                continue;
            }
            if (!builder.isEmpty()) {
                builder.append(", ");
            }
            if (!builder.toString().contains(part)) {
                builder.append(part);
            }
        }
        return builder.toString();
    }
}
