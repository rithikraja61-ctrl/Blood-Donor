package com.blooddonor.service;

/**
 * Slashy-style automated email notifications for hospital ↔ blood bank workflows.
 */
public interface HospitalNotificationService {

    void notifyBloodBankNewHospitalRequest(Long bloodBankId, Long requestId);

    void notifyHospitalRequestApproved(Long hospitalId, Long requestId);

    void notifyHospitalRequestRejected(Long hospitalId, Long requestId, String reason);
}
