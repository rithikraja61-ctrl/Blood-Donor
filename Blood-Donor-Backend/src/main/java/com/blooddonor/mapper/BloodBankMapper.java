package com.blooddonor.mapper;

import com.blooddonor.dto.request.BloodBankSignupRequest;
import com.blooddonor.dto.request.BloodBankUpdateRequest;
import com.blooddonor.dto.response.BloodBankResponse;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.validation.Role;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class BloodBankMapper {

    public BloodBank toEntity(BloodBankSignupRequest request) {
        BloodBank bloodBank = new BloodBank();
        bloodBank.setName(request.getName());
        bloodBank.setEmail(request.getEmail());
        bloodBank.setPhoneNumber(request.getPhoneNumber());
        bloodBank.setPassword(request.getPassword());
        bloodBank.setAddress(request.getAddress());
        bloodBank.setRole(Role.BLOOD_BANK);
        return bloodBank;
    }

    public BloodBankResponse toResponse(BloodBank bloodBank) {
        return BloodBankResponse.builder()
                .id(bloodBank.getId())
                .name(bloodBank.getName())
                .email(bloodBank.getEmail())
                .phoneNumber(bloodBank.getPhoneNumber())
                .address(bloodBank.getAddress())
                .createdAt(bloodBank.getCreatedAt())
                .updatedAt(bloodBank.getUpdatedAt())
                .build();
    }

    public void updateEntity(BloodBank bloodBank, BloodBankUpdateRequest request) {
        Optional.ofNullable(request.getName()).ifPresent(bloodBank::setName);
        Optional.ofNullable(request.getPhoneNumber()).ifPresent(bloodBank::setPhoneNumber);
        Optional.ofNullable(request.getAddress()).ifPresent(bloodBank::setAddress);
    }
}