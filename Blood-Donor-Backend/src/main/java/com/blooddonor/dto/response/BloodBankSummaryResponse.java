package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BloodBankSummaryResponse {

    private Long id;
    private String bloodBankName;
    private String city;
    private String pinCode;
}
