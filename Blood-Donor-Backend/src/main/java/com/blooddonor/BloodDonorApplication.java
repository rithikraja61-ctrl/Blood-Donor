package com.blooddonor;

import com.blooddonor.config.GoogleMapsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties(GoogleMapsProperties.class)
@EnableScheduling
public class BloodDonorApplication {

	public static void main(String[] args) {
		SpringApplication.run(BloodDonorApplication.class, args);
	}

}
