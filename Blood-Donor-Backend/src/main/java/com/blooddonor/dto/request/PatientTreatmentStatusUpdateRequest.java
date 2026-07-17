package com.blooddonor.dto.request;

import com.blooddonor.validation.TreatmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientTreatmentStatusUpdateRequest {

    @NotNull(message = "Treatment status is required")
    private TreatmentStatus treatmentStatus;
}
