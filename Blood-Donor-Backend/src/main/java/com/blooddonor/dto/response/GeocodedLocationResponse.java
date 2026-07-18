package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GeocodedLocationResponse {

    private Double latitude;
    private Double longitude;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String formattedAddress;
}
