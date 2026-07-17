package com.blooddonor.service.impl;

import com.blooddonor.dto.response.BloodBankDashboardResponse;
import com.blooddonor.exception.BloodBankNotFoundException;
import com.blooddonor.repository.BloodInventoryRepository;
import com.blooddonor.repository.BloodIssueRepository;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.HospitalRequestRepository;
import com.blooddonor.service.BloodBankDashboardService;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.HospitalRequestStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
public class BloodBankDashboardServiceImpl implements BloodBankDashboardService {

    private final BloodBankRepository bloodBankRepository;
    private final BloodInventoryRepository bloodInventoryRepository;
    private final HospitalRequestRepository hospitalRequestRepository;
    private final BloodIssueRepository bloodIssueRepository;
    private final SecurityUtil securityUtil;

    public BloodBankDashboardServiceImpl(
            BloodBankRepository bloodBankRepository,
            BloodInventoryRepository bloodInventoryRepository,
            HospitalRequestRepository hospitalRequestRepository,
            BloodIssueRepository bloodIssueRepository,
            SecurityUtil securityUtil) {
        this.bloodBankRepository = bloodBankRepository;
        this.bloodInventoryRepository = bloodInventoryRepository;
        this.hospitalRequestRepository = hospitalRequestRepository;
        this.bloodIssueRepository = bloodIssueRepository;
        this.securityUtil = securityUtil;
    }

    @Override
    @Transactional(readOnly = true)
    public BloodBankDashboardResponse getDashboard() {
        Long bloodBankId = findCurrentBloodBankId();
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        YearMonth currentMonth = YearMonth.from(today);
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime startOfNextMonth = currentMonth.plusMonths(1).atDay(1).atStartOfDay();

        return BloodBankDashboardResponse.builder()
                .totalBloodUnitsAvailable(bloodInventoryRepository.sumAvailableUnitsByBloodBankId(bloodBankId))
                .totalBloodRequestsReceived(hospitalRequestRepository.countByBloodBankId(bloodBankId))
                .totalBloodRequestsApproved(hospitalRequestRepository.countByBloodBankIdAndStatusIn(
                        bloodBankId,
                        List.of(HospitalRequestStatus.APPROVED, HospitalRequestStatus.COMPLETED)))
                .totalBloodRequestsRejected(hospitalRequestRepository.countByBloodBankIdAndStatus(
                        bloodBankId, HospitalRequestStatus.REJECTED))
                .totalBloodUnitsIssued(bloodIssueRepository.sumTotalIssuedUnitsByBloodBankId(bloodBankId))
                .totalPendingRequests(hospitalRequestRepository.countByBloodBankIdAndStatus(
                        bloodBankId, HospitalRequestStatus.PENDING))
                .totalExpiredBloodUnits(bloodInventoryRepository.sumExpiredAvailableUnitsByBloodBankId(
                        bloodBankId, today))
                .todaysRequests(hospitalRequestRepository.countTodaysRequestsByBloodBank(
                        bloodBankId, startOfDay, endOfDay))
                .monthlyBloodIssued(bloodIssueRepository.sumIssuedUnitsForMonthByBloodBankId(
                        bloodBankId, startOfMonth, startOfNextMonth))
                .build();
    }

    private Long findCurrentBloodBankId() {
        Long bloodBankId = securityUtil.getCurrentUserId();
        bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));
        return bloodBankId;
    }
}
