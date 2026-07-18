package com.blooddonor.service.impl;

import com.blooddonor.entity.BloodBank;
import com.blooddonor.entity.Hospital;
import com.blooddonor.entity.HospitalRequest;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.HospitalRequestRepository;
import com.blooddonor.service.EmailService;
import com.blooddonor.service.HospitalNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HospitalNotificationServiceImpl implements HospitalNotificationService {

    private final HospitalRequestRepository hospitalRequestRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;
    private final EmailService emailService;

    public HospitalNotificationServiceImpl(
            HospitalRequestRepository hospitalRequestRepository,
            HospitalRepository hospitalRepository,
            BloodBankRepository bloodBankRepository,
            EmailService emailService) {
        this.hospitalRequestRepository = hospitalRequestRepository;
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional(readOnly = true)
    public void notifyBloodBankNewHospitalRequest(Long bloodBankId, Long requestId) {
        HospitalRequest request = findRequest(requestId);
        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood bank not found"));

        String body = """
                Hello %s,

                A new hospital blood request needs your review.

                Request ID: #%d
                Hospital: %s
                Patient: %s
                Blood group: %s
                Units required: %d
                Emergency level: %s
                Required before: %s

                Log in to Blood Donors to approve or reject this request.

                — Blood Donors Automated Alerts (Slashy-style workflow)
                """.formatted(
                bloodBank.getName(),
                request.getId(),
                request.getHospitalName(),
                request.getPatientName(),
                request.getBloodGroup().getDisplayName(),
                request.getRequiredUnits(),
                request.getEmergencyLevel().name(),
                request.getRequiredBefore());

        emailService.sendEmail(
                bloodBank.getEmail(),
                "[Blood Donors] New hospital blood request — " + request.getBloodGroup().getDisplayName(),
                body);
    }

    @Override
    @Transactional(readOnly = true)
    public void notifyHospitalRequestApproved(Long hospitalId, Long requestId) {
        HospitalRequest request = findRequest(requestId);
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        String body = """
                Hello %s,

                Good news — your blood request has been approved and issued.

                Request ID: #%d
                Blood group: %s
                Units: %d
                Patient: %s
                Blood bank: %s

                — Blood Donors Automated Alerts (Slashy-style workflow)
                """.formatted(
                hospital.getName(),
                request.getId(),
                request.getBloodGroup().getDisplayName(),
                request.getRequiredUnits(),
                request.getPatientName(),
                request.getBloodBank().getName());

        emailService.sendEmail(
                hospital.getEmail(),
                "[Blood Donors] Blood request approved — " + request.getBloodGroup().getDisplayName(),
                body);
    }

    @Override
    @Transactional(readOnly = true)
    public void notifyHospitalRequestRejected(Long hospitalId, Long requestId, String reason) {
        HospitalRequest request = findRequest(requestId);
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        String body = """
                Hello %s,

                Your blood request was rejected by the blood bank.

                Request ID: #%d
                Blood group: %s
                Units requested: %d
                Patient: %s
                Reason: %s

                — Blood Donors Automated Alerts (Slashy-style workflow)
                """.formatted(
                hospital.getName(),
                request.getId(),
                request.getBloodGroup().getDisplayName(),
                request.getRequiredUnits(),
                request.getPatientName(),
                reason);

        emailService.sendEmail(
                hospital.getEmail(),
                "[Blood Donors] Blood request rejected — " + request.getBloodGroup().getDisplayName(),
                body);
    }

    private HospitalRequest findRequest(Long requestId) {
        return hospitalRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital request not found"));
    }
}
