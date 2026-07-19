package com.blooddonor.service.impl;

import com.blooddonor.dto.request.LiveLocationRequest;
import com.blooddonor.dto.request.UserUpdateRequest;
import com.blooddonor.dto.response.BloodBankSummaryResponse;
import com.blooddonor.dto.response.UserResponse;
import com.blooddonor.entity.User;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.UserMapper;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.UserRepository;
import com.blooddonor.service.UserService;
import com.blooddonor.service.AccountLocationService;
import com.blooddonor.util.SecurityUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BloodBankRepository bloodBankRepository;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;
    private final AccountLocationService accountLocationService;

    public UserServiceImpl(
            UserRepository userRepository,
            BloodBankRepository bloodBankRepository,
            UserMapper userMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder,
            AccountLocationService accountLocationService) {
        this.userRepository = userRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.userMapper = userMapper;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
        this.accountLocationService = accountLocationService;
    }

    @Override
    public UserResponse getProfile() {
        User user = findCurrentUser();
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateProfile(UserUpdateRequest request) {
        User user = findCurrentUser();
        userMapper.updateEntity(user, request);

        accountLocationService.applyLocation(
                user,
                request.getLatitude(),
                request.getLongitude(),
                user.getAddress(),
                null,
                null,
                user.getPincode());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse updateLiveLocation(LiveLocationRequest request) {
        User user = findCurrentUser();
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void deleteAccount() {
        User user = findCurrentUser();
        userRepository.delete(user);
    }

    @Override
    public List<BloodBankSummaryResponse> listAvailableBloodBanks() {
        return bloodBankRepository.findAll().stream()
                .map(bloodBank -> BloodBankSummaryResponse.builder()
                        .id(bloodBank.getId())
                        .bloodBankName(bloodBank.getName())
                        .city(bloodBank.getCity())
                        .pinCode(bloodBank.getPincode())
                        .build())
                .toList();
    }

    private User findCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
