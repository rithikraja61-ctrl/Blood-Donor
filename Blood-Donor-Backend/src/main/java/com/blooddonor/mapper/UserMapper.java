package com.blooddonor.mapper;

import com.blooddonor.dto.request.UserSignupRequest;
import com.blooddonor.dto.request.UserUpdateRequest;
import com.blooddonor.dto.response.UserResponse;
import com.blooddonor.entity.User;
import com.blooddonor.validation.Role;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserMapper {

    public User toEntity(UserSignupRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(request.getPassword());
        user.setAddress(request.getAddress());
        user.setPincode(request.getPincode());
        user.setBloodType(request.getBloodType());
        user.setRole(Role.USER);
        return user;
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .pincode(user.getPincode())
                .bloodType(user.getBloodType())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public void updateEntity(User user, UserUpdateRequest request) {
        Optional.ofNullable(request.getName()).ifPresent(user::setName);
        Optional.ofNullable(request.getPhoneNumber()).ifPresent(user::setPhoneNumber);
        Optional.ofNullable(request.getAddress()).ifPresent(user::setAddress);
        Optional.ofNullable(request.getPincode()).ifPresent(user::setPincode);
        Optional.ofNullable(request.getBloodType()).ifPresent(user::setBloodType);
    }
}