package com.blooddonor.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "google.maps")
public class GoogleMapsProperties {

    /**
     * Server-side key for Geocoding API (Places backend usage).
     */
    private String apiKey = "";

    private double defaultSearchRadiusKm = 25.0;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public double getDefaultSearchRadiusKm() {
        return defaultSearchRadiusKm;
    }

    public void setDefaultSearchRadiusKm(double defaultSearchRadiusKm) {
        this.defaultSearchRadiusKm = defaultSearchRadiusKm;
    }
}
