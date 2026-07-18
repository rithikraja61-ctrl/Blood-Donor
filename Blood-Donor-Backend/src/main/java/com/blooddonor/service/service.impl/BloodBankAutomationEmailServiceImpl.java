package com.blooddonor.service.impl;

import com.blooddonor.config.BloodDonorMailProperties;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.entity.BloodInventory;
import com.blooddonor.exception.BloodBankNotFoundException;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.BloodInventoryRepository;
import com.blooddonor.repository.HospitalRequestRepository;
import com.blooddonor.service.BloodBankAutomationEmailService;
import com.blooddonor.service.EmailService;
import com.blooddonor.validation.HospitalRequestStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BloodBankAutomationEmailServiceImpl implements BloodBankAutomationEmailService {

    private final BloodBankRepository bloodBankRepository;
    private final BloodInventoryRepository bloodInventoryRepository;
    private final HospitalRequestRepository hospitalRequestRepository;
    private final EmailService emailService;
    private final BloodDonorMailProperties mailProperties;

    public BloodBankAutomationEmailServiceImpl(
            BloodBankRepository bloodBankRepository,
            BloodInventoryRepository bloodInventoryRepository,
            HospitalRequestRepository hospitalRequestRepository,
            EmailService emailService,
            BloodDonorMailProperties mailProperties) {
        this.bloodBankRepository = bloodBankRepository;
        this.bloodInventoryRepository = bloodInventoryRepository;
        this.hospitalRequestRepository = hospitalRequestRepository;
        this.emailService = emailService;
        this.mailProperties = mailProperties;
    }

    @Override
    @Transactional(readOnly = true)
    public void checkAndNotifyBloodBank(Long bloodBankId) {
        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));

        List<String> alertLines = buildAlertLines(bloodBankId);
        if (alertLines.isEmpty()) {
            return;
        }

        String body = """
                Hello %s,

                Automated inventory alerts (Slashy-style workflow):

                %s

                Please review your Blood Donors inventory dashboard and take action if needed.

                — Blood Donors Automated Alerts
                """.formatted(bloodBank.getName(), String.join("\n", alertLines));

        emailService.sendEmail(
                bloodBank.getEmail(),
                "[Blood Donors] Inventory alert",
                body);
    }

    @Override
    @Transactional(readOnly = true)
    public void notifyAllBloodBanksDaily() {
        bloodBankRepository.findAll().forEach(bloodBank -> checkAndNotifyBloodBank(bloodBank.getId()));
    }

    private List<String> buildAlertLines(Long bloodBankId) {
        List<String> lines = new ArrayList<>();
        int lowStockThreshold = mailProperties.getLowStockThreshold();
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(mailProperties.getExpiryWarningDays());

        List<BloodInventory> inventoryRows =
                bloodInventoryRepository.findByBloodBankIdOrderByBloodGroupAsc(bloodBankId);

        for (BloodInventory row : inventoryRows) {
            String bloodGroup = row.getBloodGroup().getDisplayName();

            if (row.getAvailableUnits() == 0) {
                long pendingRequests = hospitalRequestRepository
                        .countByBloodBankIdAndBloodGroupAndStatus(
                                bloodBankId, row.getBloodGroup(), HospitalRequestStatus.PENDING);
                if (pendingRequests > 0) {
                    lines.add("• Urgent: %s has 0 units but %d pending hospital request(s)."
                            .formatted(bloodGroup, pendingRequests));
                }
            } else if (row.getAvailableUnits() < lowStockThreshold) {
                lines.add("• Low stock: %s — only %d unit(s) left."
                        .formatted(bloodGroup, row.getAvailableUnits()));
            }

            if (row.getAvailableUnits() > 0
                    && row.getExpiryDate() != null
                    && !row.getExpiryDate().isBefore(today)
                    && !row.getExpiryDate().isAfter(warningDate)) {
                lines.add("• Expiring soon: %s (%d unit(s)) expires on %s."
                        .formatted(bloodGroup, row.getAvailableUnits(), row.getExpiryDate()));
            }

            if (row.getAvailableUnits() > 0
                    && row.getExpiryDate() != null
                    && row.getExpiryDate().isBefore(today)) {
                lines.add("• Expired: %s still shows %d unit(s) past expiry (%s)."
                        .formatted(bloodGroup, row.getAvailableUnits(), row.getExpiryDate()));
            }
        }

        return lines;
    }
}
