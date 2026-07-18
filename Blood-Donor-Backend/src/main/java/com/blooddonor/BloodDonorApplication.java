package com.blooddonor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BloodDonorApplication {

	public static void main(String[] args) {
		SpringApplication.run(BloodDonorApplication.class, args);
	}

}
