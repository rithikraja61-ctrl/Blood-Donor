package com.blooddonor.service;

/**
 * Placeholder for future notification integrations (email, SMS, push, AI alerts).
 */
public interface HospitalNotificationService {

    void notifyHospitalRequestApproved(Long hospitalId, Long requestId);

    void notifyHospitalRequestRejected(Long hospitalId, Long requestId, String reason);
}
