package com.blooddonor.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaFixConfig implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaFixConfig.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaFixConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        allowNullHospitalIdOnUserRequests();
    }

    private void allowNullHospitalIdOnUserRequests() {
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE hospital_requests MODIFY COLUMN hospital_id BIGINT NULL");
            log.info("Ensured hospital_requests.hospital_id allows NULL for user-initiated requests");
        } catch (Exception ex) {
            log.warn("Could not update hospital_requests.hospital_id nullability: {}", ex.getMessage());
        }
    }
}
