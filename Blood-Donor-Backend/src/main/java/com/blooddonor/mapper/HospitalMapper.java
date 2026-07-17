package com.blooddonor.mapper;

import com.blooddonor.dto.request.HospitalSignupRequest;
import com.blooddonor.dto.request.HospitalUpdateRequest;
import com.blooddonor.dto.response.HospitalResponse;
import com.blooddonor.entity.Hospital;
import com.blooddonor.validation.Role;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class HospitalMapper {

    public Hospital toEntity(HospitalSignupRequest request) {
        Hospital hospital = new Hospital();
        hospital.setName(request.getName());
        hospital.setEmail(request.getEmail());
        hospital.setPhoneNumber(request.getPhoneNumber());
        hospital.setPassword(request.getPassword());
        hospital.setAddress(request.getAddress());
        hospital.setPincode(request.getPincode());
        hospital.setCity(request.getCity());
        hospital.setState(request.getState());
        hospital.setLicenseNumber(request.getLicenseNumber());
        hospital.setProfileImageUrl(request.getProfileImageUrl());
        hospital.setRole(Role.HOSPITAL);
        return hospital;
    }

    public HospitalResponse toResponse(Hospital hospital) {
        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .email(hospital.getEmail())
                .phoneNumber(hospital.getPhoneNumber())
                .address(hospital.getAddress())
                .city(hospital.getCity())
                .state(hospital.getState())
                .pincode(hospital.getPincode())
                .licenseNumber(hospital.getLicenseNumber())
                .profileImageUrl(hospital.getProfileImageUrl())
                .registrationDate(hospital.getCreatedAt())
                .updatedAt(hospital.getUpdatedAt())
                .build();
    }

    public void updateEntity(Hospital hospital, HospitalUpdateRequest request) {
        Optional.ofNullable(request.getName()).ifPresent(hospital::setName);
        Optional.ofNullable(request.getPhoneNumber()).ifPresent(hospital::setPhoneNumber);
        Optional.ofNullable(request.getAddress()).ifPresent(hospital::setAddress);
        Optional.ofNullable(request.getPincode()).ifPresent(hospital::setPincode);
        Optional.ofNullable(request.getCity()).ifPresent(hospital::setCity);
        Optional.ofNullable(request.getState()).ifPresent(hospital::setState);
        Optional.ofNullable(request.getLicenseNumber()).ifPresent(hospital::setLicenseNumber);
        Optional.ofNullable(request.getProfileImageUrl()).ifPresent(hospital::setProfileImageUrl);
    }
}
