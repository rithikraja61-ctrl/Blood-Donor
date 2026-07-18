package com.blooddonor.scheduler;

import com.blooddonor.service.BloodBankAutomationEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BloodBankInventoryAlertScheduler {

    private static final Logger log = LoggerFactory.getLogger(BloodBankInventoryAlertScheduler.class);

    private final BloodBankAutomationEmailService bloodBankAutomationEmailService;

    public BloodBankInventoryAlertScheduler(BloodBankAutomationEmailService bloodBankAutomationEmailService) {
        this.bloodBankAutomationEmailService = bloodBankAutomationEmailService;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyInventoryAlerts() {
        log.info("Running daily Slashy-style inventory alert emails");
        bloodBankAutomationEmailService.notifyAllBloodBanksDaily();
    }
}
