package com.blooddonor.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "blood-donor.mail")
public class BloodDonorMailProperties {

    private boolean enabled;
    private String fromName = "Blood Donors";
    private int lowStockThreshold = 5;
    private int expiryWarningDays = 7;
}
