package com.blooddonor.repository;

import com.blooddonor.entity.BloodIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BloodIssueRepository extends JpaRepository<BloodIssue, Long> {

    List<BloodIssue> findByBloodBankIdOrderByIssueDateDesc(Long bloodBankId);

    @Query("""
            SELECT COALESCE(SUM(bi.units), 0) FROM BloodIssue bi
            WHERE bi.bloodBank.id = :bloodBankId
            """)
    long sumTotalIssuedUnitsByBloodBankId(@Param("bloodBankId") Long bloodBankId);

    @Query("""
            SELECT COALESCE(SUM(bi.units), 0) FROM BloodIssue bi
            WHERE bi.bloodBank.id = :bloodBankId
              AND bi.issueDate >= :startOfMonth
              AND bi.issueDate < :startOfNextMonth
            """)
    long sumIssuedUnitsForMonthByBloodBankId(
            @Param("bloodBankId") Long bloodBankId,
            @Param("startOfMonth") LocalDateTime startOfMonth,
            @Param("startOfNextMonth") LocalDateTime startOfNextMonth);
}
