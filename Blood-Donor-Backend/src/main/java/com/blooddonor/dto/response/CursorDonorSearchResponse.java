package com.blooddonor.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CursorDonorSearchResponse {

    private List<DonorSearchResponse> content;
    private String nextCursor;
    private String previousCursor;
}
