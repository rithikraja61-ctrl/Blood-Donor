package com.blooddonor.repository;

import com.blooddonor.entity.BloodBank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BloodBankRepository extends JpaRepository<BloodBank, Long> {

    Optional<BloodBank> findByEmail(String email);

    boolean existsByEmail(String email);
}