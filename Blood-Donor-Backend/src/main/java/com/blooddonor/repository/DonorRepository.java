package com.blooddonor.repository;

import com.blooddonor.entity.Donor;
import com.blooddonor.validation.BloodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DonorRepository extends JpaRepository<Donor, Long> {

    Optional<Donor> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
        SELECT d FROM Donor d
        WHERE d.active = true
          AND d.blocked = false
          AND d.available = true
          AND d.bloodType IN :bloodTypes
          AND (d.lastDonationDate IS NULL OR d.lastDonationDate <= :cutoffDate)
        """)
    List<Donor> findEligibleDonors(
            @Param("bloodTypes") List<BloodType> bloodTypes,
            @Param("cutoffDate") LocalDate cutoffDate
    );
}