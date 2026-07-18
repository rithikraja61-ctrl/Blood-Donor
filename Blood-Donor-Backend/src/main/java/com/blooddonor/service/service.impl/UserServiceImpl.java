package com.blooddonor.service.impl;

import com.blooddonor.dto.request.UserUpdateRequest;
import com.blooddonor.dto.response.UserResponse;
import com.blooddonor.entity.User;
import com.blooddonor.exception.ResourceNotFoundException;
import com.blooddonor.mapper.UserMapper;
import com.blooddonor.repository.UserRepository;
import com.blooddonor.service.UserService;
import com.blooddonor.service.AccountLocationService;
import com.blooddonor.util.SecurityUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;
    private final AccountLocationService accountLocationService;

    public UserServiceImpl(
            UserRepository userRepository,
            UserMapper userMapper,
            SecurityUtil securityUtil,
            PasswordEncoder passwordEncoder,
            AccountLocationService accountLocationService) {
        this.userRepository = userRepository;
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
    public void deleteAccount() {
        User user = findCurrentUser();
        userRepository.delete(user);
    }

    private User findCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
