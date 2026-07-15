package com.blooddonor.mapper;

import com.blooddonor.dto.request.DonorSignupRequest;
import com.blooddonor.dto.request.DonorUpdateRequest;
import com.blooddonor.dto.response.DonorResponse;
import com.blooddonor.entity.Donor;
import com.blooddonor.validation.Role;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DonorMapper {

    public Donor toEntity(DonorSignupRequest request) {
        Donor donor = new Donor();
        donor.setName(request.getName());
        donor.setEmail(request.getEmail());
        donor.setPhoneNumber(request.getPhoneNumber());
        donor.setPassword(request.getPassword());
        donor.setAddress(request.getAddress());
        donor.setPincode(request.getPincode());
        donor.setBloodType(request.getBloodType());
        donor.setAvailable(true);
        donor.setRole(Role.DONOR);
        return donor;
    }

    public DonorResponse toResponse(Donor donor) {
        return DonorResponse.builder()
                .id(donor.getId())
                .name(donor.getName())
                .email(donor.getEmail())
                .phoneNumber(donor.getPhoneNumber())
                .address(donor.getAddress())
                .pincode(donor.getPincode())
                .bloodType(donor.getBloodType())
                .available(donor.isAvailable())
                .createdAt(donor.getCreatedAt())
                .updatedAt(donor.getUpdatedAt())
                .build();
    }

    public void updateEntity(Donor donor, DonorUpdateRequest request) {
        Optional.ofNullable(request.getName()).ifPresent(donor::setName);
        Optional.ofNullable(request.getPhoneNumber()).ifPresent(donor::setPhoneNumber);
        Optional.ofNullable(request.getAddress()).ifPresent(donor::setAddress);
        Optional.ofNullable(request.getPincode()).ifPresent(donor::setPincode);
        Optional.ofNullable(request.getBloodType()).ifPresent(donor::setBloodType);
        Optional.ofNullable(request.getAvailable()).ifPresent(donor::setAvailable);
    }
}