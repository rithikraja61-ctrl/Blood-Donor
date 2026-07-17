package com.blooddonor.repository;

import com.blooddonor.entity.BloodRequest;
import com.blooddonor.validation.BloodRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    List<BloodRequest> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);

    List<BloodRequest> findByDonorIdOrderByCreatedAtDesc(Long donorId);

    Optional<BloodRequest> findByIdAndHospitalId(Long id, Long hospitalId);

    Optional<BloodRequest> findByIdAndDonorId(Long id, Long donorId);

    long countByHospitalId(Long hospitalId);

    @Query("""
            SELECT COUNT(br) FROM BloodRequest br
            WHERE br.hospital.id = :hospitalId
              AND br.status = :status
              AND br.completedAt >= :startOfDay
              AND br.completedAt < :endOfDay
            """)
    long countCompletedTodayByHospital(
            @Param("hospitalId") Long hospitalId,
            @Param("status") BloodRequestStatus status,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("""
            SELECT COUNT(DISTINCT br.donor.id) FROM BloodRequest br
            WHERE br.hospital.id = :hospitalId
              AND br.status = :status
            """)
    long countDistinctDonorsWithAcceptedRequests(
            @Param("hospitalId") Long hospitalId,
            @Param("status") BloodRequestStatus status);

    Optional<BloodRequest> findTopByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<BloodRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<BloodRequest> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndDonorIdAndStatus(Long userId, Long donorId, BloodRequestStatus status);

    boolean existsByPatientIdAndDonorIdAndStatus(Long patientId, Long donorId, BloodRequestStatus status);

    List<BloodRequest> findByRequestGroupIdAndStatus(String requestGroupId, BloodRequestStatus status);

    long countByDonorIdAndStatus(Long donorId, BloodRequestStatus status);

    @Query("""
            SELECT COUNT(br) FROM BloodRequest br
            WHERE br.donor.id = :donorId
              AND br.status IN :statuses
            """)
    long countByDonorIdAndStatusIn(
            @Param("donorId") Long donorId,
            @Param("statuses") List<BloodRequestStatus> statuses);
}
