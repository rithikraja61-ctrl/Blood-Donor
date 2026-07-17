package com.blooddonor.service.impl;

import com.blooddonor.service.HospitalNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class HospitalNotificationServiceImpl implements HospitalNotificationService {

    private static final Logger log = LoggerFactory.getLogger(HospitalNotificationServiceImpl.class);

    @Override
    public void notifyHospitalRequestApproved(Long hospitalId, Long requestId) {
        log.info("Placeholder notification: hospital {} request {} approved", hospitalId, requestId);
    }

    @Override
    public void notifyHospitalRequestRejected(Long hospitalId, Long requestId, String reason) {
        log.info("Placeholder notification: hospital {} request {} rejected. Reason: {}",
                hospitalId, requestId, reason);
    }
}
