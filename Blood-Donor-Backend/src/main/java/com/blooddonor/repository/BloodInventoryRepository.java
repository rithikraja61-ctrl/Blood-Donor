package com.blooddonor.repository;

import com.blooddonor.entity.BloodInventory;
import com.blooddonor.validation.BloodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {

    List<BloodInventory> findByBloodBankIdOrderByBloodGroupAsc(Long bloodBankId);

    Optional<BloodInventory> findByBloodBankIdAndBloodGroup(Long bloodBankId, BloodType bloodGroup);

    @Query("""
            SELECT COALESCE(SUM(bi.availableUnits), 0) FROM BloodInventory bi
            WHERE bi.bloodBank.id = :bloodBankId
            """)
    long sumAvailableUnitsByBloodBankId(@Param("bloodBankId") Long bloodBankId);

    @Query("""
            SELECT COALESCE(SUM(bi.availableUnits), 0) FROM BloodInventory bi
            WHERE bi.bloodBank.id = :bloodBankId
              AND bi.expiryDate IS NOT NULL
              AND bi.expiryDate < :today
            """)
    long sumExpiredAvailableUnitsByBloodBankId(
            @Param("bloodBankId") Long bloodBankId,
            @Param("today") LocalDate today);
}
