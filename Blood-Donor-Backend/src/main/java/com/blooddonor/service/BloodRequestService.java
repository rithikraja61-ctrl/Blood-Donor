package com.blooddonor.service;

import com.blooddonor.dto.request.SendBloodRequestDto;
import com.blooddonor.dto.request.UserSendBloodRequestDto;
import com.blooddonor.dto.response.BloodRequestResponse;

import java.util.List;

public interface BloodRequestService {

    List<BloodRequestResponse> sendBloodRequests(SendBloodRequestDto request);

    List<BloodRequestResponse> sendBloodRequestsForUser(UserSendBloodRequestDto request);

    List<BloodRequestResponse> listSentRequestsForHospital();

    BloodRequestResponse getRequestStatusForHospital(Long requestId);

    List<BloodRequestResponse> listSentRequestsForUser();

    BloodRequestResponse getRequestStatusForUser(Long requestId);

    List<BloodRequestResponse> listIncomingForDonor();

    BloodRequestResponse acceptRequest(Long requestId);

    BloodRequestResponse rejectRequest(Long requestId);
}
