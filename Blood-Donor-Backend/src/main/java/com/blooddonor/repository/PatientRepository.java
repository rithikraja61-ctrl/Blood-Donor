package com.blooddonor.repository;

import com.blooddonor.entity.Patient;
import com.blooddonor.validation.TreatmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);

    Optional<Patient> findByIdAndHospitalId(Long id, Long hospitalId);

    long countByHospitalId(Long hospitalId);

    @Query("""
            SELECT COUNT(p) FROM Patient p
            WHERE p.hospital.id = :hospitalId
              AND p.treatmentStatus <> :completed
            """)
    long countPatientsWaitingForBlood(
            @Param("hospitalId") Long hospitalId,
            @Param("completed") TreatmentStatus completed);

    long countByHospitalIdAndTreatmentStatus(Long hospitalId, TreatmentStatus treatmentStatus);

    @Query("""
            SELECT COUNT(p) FROM Patient p
            WHERE p.hospital.id = :hospitalId
              AND p.donorAssigned = false
              AND p.treatmentStatus <> :completed
            """)
    long countPatientsStillWaitingForDonors(
            @Param("hospitalId") Long hospitalId,
            @Param("completed") TreatmentStatus completed);
}
