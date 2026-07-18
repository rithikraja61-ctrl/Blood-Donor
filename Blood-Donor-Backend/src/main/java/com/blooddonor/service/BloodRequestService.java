package com.blooddonor.service;

import com.blooddonor.dto.request.BloodBankSendBloodRequestDto;
import com.blooddonor.dto.request.SendBloodRequestDto;
import com.blooddonor.dto.request.UserSendBloodRequestDto;
import com.blooddonor.dto.response.AssignedDonorResponse;
import com.blooddonor.dto.response.BloodRequestResponse;

import java.util.List;

public interface BloodRequestService {

    List<BloodRequestResponse> sendBloodRequests(SendBloodRequestDto request);

    List<BloodRequestResponse> sendBloodRequestsForUser(UserSendBloodRequestDto request);

    List<BloodRequestResponse> sendBloodRequestsForBloodBank(BloodBankSendBloodRequestDto request);

    List<BloodRequestResponse> listReceivedRoutingRequestsForBloodBank();

    BloodRequestResponse acceptReceivedRequestForBloodBank(Long requestId);

    BloodRequestResponse rejectReceivedRequestForBloodBank(Long requestId);

    List<BloodRequestResponse> listSentRequestsForHospital();

    BloodRequestResponse getRequestStatusForHospital(Long requestId);

    AssignedDonorResponse getAssignedDonorForRequest(Long requestId);

    AssignedDonorResponse getAssignedDonorForPatient(Long patientId);

    List<BloodRequestResponse> listSentRequestsForBloodBank();

    List<BloodRequestResponse> listSentRequestsForUser();

    BloodRequestResponse getRequestStatusForUser(Long requestId);

    List<BloodRequestResponse> listIncomingForDonor();

    BloodRequestResponse acceptRequest(Long requestId);

    BloodRequestResponse rejectRequest(Long requestId);
}
