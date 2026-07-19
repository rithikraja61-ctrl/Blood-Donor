package com.blooddonor.service;

import com.blooddonor.dto.request.CreateHospitalRequestDto;
import com.blooddonor.dto.request.UserBloodBankRequestDto;
import com.blooddonor.dto.response.HospitalRequestResponse;

import java.util.List;

public interface BloodBankHospitalRequestService {

    HospitalRequestResponse createRequestFromHospital(CreateHospitalRequestDto request);

    HospitalRequestResponse createRequestFromUser(UserBloodBankRequestDto request);

    List<HospitalRequestResponse> getAllRequests();

    HospitalRequestResponse getRequestById(Long requestId);

    HospitalRequestResponse approveRequest(Long requestId);

    HospitalRequestResponse rejectRequest(Long requestId);
}
