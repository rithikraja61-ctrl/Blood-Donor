package com.blooddonor.repository;

import com.blooddonor.entity.HospitalRequest;
import com.blooddonor.validation.HospitalRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HospitalRequestRepository extends JpaRepository<HospitalRequest, Long> {

    List<HospitalRequest> findByBloodBankIdOrderByCreatedAtDesc(Long bloodBankId);

    Optional<HospitalRequest> findByIdAndBloodBankId(Long id, Long bloodBankId);

    long countByBloodBankId(Long bloodBankId);

    long countByBloodBankIdAndStatus(Long bloodBankId, HospitalRequestStatus status);

    @Query("""
            SELECT COUNT(hr) FROM HospitalRequest hr
            WHERE hr.bloodBank.id = :bloodBankId
              AND hr.status IN :statuses
            """)
    long countByBloodBankIdAndStatusIn(
            @Param("bloodBankId") Long bloodBankId,
            @Param("statuses") List<HospitalRequestStatus> statuses);

    @Query("""
            SELECT COUNT(hr) FROM HospitalRequest hr
            WHERE hr.bloodBank.id = :bloodBankId
              AND hr.createdAt >= :startOfDay
              AND hr.createdAt < :endOfDay
            """)
    long countTodaysRequestsByBloodBank(
            @Param("bloodBankId") Long bloodBankId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    List<HospitalRequest> findByBloodBankIdAndStatus(Long bloodBankId, HospitalRequestStatus status);
}
