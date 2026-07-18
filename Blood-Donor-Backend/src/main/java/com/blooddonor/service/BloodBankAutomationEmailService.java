package com.blooddonor.service;

public interface BloodBankAutomationEmailService {

    void checkAndNotifyBloodBank(Long bloodBankId);

    void notifyAllBloodBanksDaily();
}
