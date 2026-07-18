package com.blooddonor.service;

import com.blooddonor.exception.BadRequestException;
import com.blooddonor.util.GeocodedAddress;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OpenStreetMapGeocodingService {

    private static final String USER_AGENT = "BloodDonorApp/1.0";
    private static final Pattern ARRAY_START_PATTERN = Pattern.compile("^\\s*\\[");

    private final RestClient restClient;

    public OpenStreetMapGeocodingService() {
        this.restClient = RestClient.create();
    }

    public GeocodedAddress reverseGeocode(double latitude, double longitude) {
        URI uri = UriComponentsBuilder
                .fromUriString("https://nominatim.openstreetmap.org/reverse")
                .queryParam("lat", latitude)
                .queryParam("lon", longitude)
                .queryParam("format", "json")
                .queryParam("addressdetails", 1)
                .build(true)
                .toUri();
        return parseReverseResponse(fetchBody(uri), latitude, longitude);
    }

    public GeocodedAddress geocodeSearchQuery(String query) {
        if (query == null || query.isBlank()) {
            throw new BadRequestException("Search query is required for geocoding");
        }

        String normalizedQuery = query.trim();
        URI uri = UriComponentsBuilder
                .fromUriString("https://nominatim.openstreetmap.org/search")
                .queryParam("q", normalizedQuery)
                .queryParam("countrycodes", "in")
                .queryParam("format", "json")
                .queryParam("addressdetails", 1)
                .queryParam("limit", 1)
                .build(true)
                .toUri();

        String body = fetchBody(uri);
        if (!ARRAY_START_PATTERN.matcher(body).find() || "[]".equals(body.trim())) {
            throw new BadRequestException("Unable to geocode location: ZERO_RESULTS");
        }

        return parseSearchResponse(body, normalizedQuery);
    }

    public List<GeocodedAddress> suggestSearchQuery(String query, int limit) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        String normalizedQuery = query.trim();
        int safeLimit = Math.max(1, Math.min(limit, 8));
        URI uri = UriComponentsBuilder
                .fromUriString("https://nominatim.openstreetmap.org/search")
                .queryParam("q", normalizedQuery)
                .queryParam("countrycodes", "in")
                .queryParam("format", "json")
                .queryParam("addressdetails", 1)
                .queryParam("limit", safeLimit)
                .build(true)
                .toUri();

        String body = fetchBody(uri);
        return parseSuggestResponse(body, normalizedQuery);
    }

    private List<GeocodedAddress> parseSuggestResponse(String body, String originalQuery) {
        if (!ARRAY_START_PATTERN.matcher(body).find() || "[]".equals(body.trim())) {
            return List.of();
        }

        String[] chunks = body.split("\\{\"place_id\"");
        List<GeocodedAddress> suggestions = new ArrayList<>();
        for (int index = 1; index < chunks.length; index++) {
            String chunk = "{\"place_id\"" + chunks[index];
            int end = chunk.lastIndexOf('}');
            if (end <= 0) {
                continue;
            }
            chunk = chunk.substring(0, end + 1);

            String displayName = extractField(chunk, "display_name");
            if (displayName.isBlank()) {
                continue;
            }

            double lat = parseDoubleField(chunk, "lat");
            double lng = parseDoubleField(chunk, "lon");
            suggestions.add(buildGeocodedAddress(chunk, lat, lng, displayName, originalQuery));
        }
        return suggestions;
    }

    private String fetchBody(URI uri) {
        String body = restClient.get()
                .uri(uri)
                .header(HttpHeaders.USER_AGENT, USER_AGENT)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.ACCEPT_LANGUAGE, "en")
                .retrieve()
                .body(String.class);

        if (body == null || body.isBlank()) {
            throw new BadRequestException("Unable to geocode location: NO_RESPONSE");
        }
        return body;
    }

    private GeocodedAddress parseReverseResponse(String body, double latitude, double longitude) {
        String displayName = extractField(body, "display_name");
        if (displayName.isBlank()) {
            throw new BadRequestException("Unable to geocode location: INVALID_RESPONSE");
        }

        return buildGeocodedAddress(
                body,
                latitude,
                longitude,
                displayName,
                "");
    }

    private GeocodedAddress parseSearchResponse(String body, String originalQuery) {
        String displayName = extractField(body, "display_name");
        if (displayName.isBlank()) {
            throw new BadRequestException("Unable to geocode location: INVALID_RESPONSE");
        }

        double lat = parseDoubleField(body, "lat");
        double lng = parseDoubleField(body, "lon");
        return buildGeocodedAddress(body, lat, lng, displayName, originalQuery);
    }

    private GeocodedAddress buildGeocodedAddress(
            String body,
            double latitude,
            double longitude,
            String displayName,
            String originalQuery) {
        String city = firstNonBlank(
                extractField(body, "city"),
                extractField(body, "town"),
                extractField(body, "village"),
                extractField(body, "state_district"),
                extractField(body, "county"));
        String state = extractField(body, "state");
        String pincode = extractField(body, "postcode");
        if (pincode.isBlank() && "postcode".equals(extractField(body, "type"))) {
            pincode = extractField(body, "name");
        }
        if (pincode.isBlank() && originalQuery.matches("^[0-9]{6}$")) {
            pincode = originalQuery;
        }

        String street = joinUnique(
                extractField(body, "house_number"),
                extractField(body, "road"),
                extractField(body, "neighbourhood"),
                extractField(body, "suburb"),
                extractField(body, "quarter"));
        String address = deriveAddressLine(street, displayName, city, state, pincode);
        if (address.isBlank() && !city.isBlank()) {
            address = city;
        }
        if (address.isBlank()) {
            address = inferPartFromDisplayName(displayName, 3);
        }

        if (city.isBlank()) {
            city = inferPartFromDisplayName(displayName, 2);
        }
        if (state.isBlank()) {
            state = inferPartFromDisplayName(displayName, 1);
        }

        return new GeocodedAddress(latitude, longitude, address, city, state, pincode, displayName);
    }

    private double parseDoubleField(String body, String field) {
        String value = extractField(body, field);
        if (value.isBlank()) {
            throw new BadRequestException("Unable to geocode location: INVALID_RESPONSE");
        }
        return Double.parseDouble(value);
    }

    private String extractField(String body, String field) {
        Pattern pattern = Pattern.compile(
                "\"" + Pattern.quote(field) + "\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");
        Matcher matcher = pattern.matcher(body);
        if (matcher.find()) {
            return unescapeJson(matcher.group(1));
        }
        return "";
    }

    private String inferPartFromDisplayName(String displayName, int indexFromEnd) {
        String[] parts = displayName.split(",");
        int target = parts.length - 1 - indexFromEnd;
        if (target < 0 || target >= parts.length) {
            return "";
        }
        String part = parts[target].trim();
        if ("India".equalsIgnoreCase(part)) {
            return "";
        }
        return part.replaceAll("\\b\\d{6}\\b", "").trim();
    }

    private String deriveAddressLine(String street, String displayName, String city, String state, String pincode) {
        if (street != null && !street.isBlank()) {
            return street;
        }
        if (displayName == null || displayName.isBlank()) {
            return "";
        }

        String[] parts = displayName.split(",");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            if ("India".equalsIgnoreCase(trimmed)) {
                continue;
            }
            if (city != null && !city.isBlank() && trimmed.equals(city)) {
                continue;
            }
            if (state != null && !state.isBlank() && (trimmed.equals(state) || trimmed.startsWith(state + " "))) {
                continue;
            }
            if (pincode != null && !pincode.isBlank() && trimmed.contains(pincode)) {
                continue;
            }
            if (trimmed.matches("^[0-9]{6}$")) {
                continue;
            }
            if (!builder.isEmpty()) {
                builder.append(", ");
            }
            builder.append(trimmed);
        }
        return builder.toString().trim();
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
