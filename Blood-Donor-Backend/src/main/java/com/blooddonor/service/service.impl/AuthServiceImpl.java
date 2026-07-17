package com.blooddonor.service.impl;

import com.blooddonor.dto.request.BloodBankSignupRequest;
import com.blooddonor.dto.request.DonorSignupRequest;
import com.blooddonor.dto.request.HospitalSignupRequest;
import com.blooddonor.dto.request.LoginRequest;
import com.blooddonor.dto.request.UserSignupRequest;
import com.blooddonor.dto.response.AuthResponse;
import com.blooddonor.entity.BaseAccount;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.entity.Donor;
import com.blooddonor.entity.Hospital;
import com.blooddonor.entity.User;
import com.blooddonor.exception.BadRequestException;
import com.blooddonor.exception.DuplicateResourceException;
import com.blooddonor.mapper.BloodBankMapper;
import com.blooddonor.mapper.DonorMapper;
import com.blooddonor.mapper.HospitalMapper;
import com.blooddonor.mapper.UserMapper;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.UserRepository;
import com.blooddonor.security.CustomUserDetails;
import com.blooddonor.service.AuthService;
import com.blooddonor.service.BloodBankInventoryService;
import com.blooddonor.util.JwtUtil;
import com.blooddonor.validation.Role;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;
    private final UserMapper userMapper;
    private final DonorMapper donorMapper;
    private final HospitalMapper hospitalMapper;
    private final BloodBankMapper bloodBankMapper;
    private final BloodBankInventoryService bloodBankInventoryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            DonorRepository donorRepository,
            HospitalRepository hospitalRepository,
            BloodBankRepository bloodBankRepository,
            UserMapper userMapper,
            DonorMapper donorMapper,
            HospitalMapper hospitalMapper,
            BloodBankMapper bloodBankMapper,
            BloodBankInventoryService bloodBankInventoryService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.userMapper = userMapper;
        this.donorMapper = donorMapper;
        this.hospitalMapper = hospitalMapper;
        this.bloodBankMapper = bloodBankMapper;
        this.bloodBankInventoryService = bloodBankInventoryService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponse registerUser(UserSignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthResponse registerDonor(DonorSignupRequest request) {
        if (donorRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        Donor donor = donorMapper.toEntity(request);
        donor.setPassword(passwordEncoder.encode(request.getPassword()));
        Donor savedDonor = donorRepository.save(donor);

        return buildAuthResponse(savedDonor);
    }

    @Override
    public AuthResponse registerHospital(HospitalSignupRequest request) {
        if (hospitalRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        Hospital hospital = hospitalMapper.toEntity(request);
        hospital.setPassword(passwordEncoder.encode(request.getPassword()));
        Hospital savedHospital = hospitalRepository.save(hospital);

        return buildAuthResponse(savedHospital);
    }

    @Override
    public AuthResponse registerBloodBank(BloodBankSignupRequest request) {
        if (bloodBankRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        BloodBank bloodBank = bloodBankMapper.toEntity(request);
        bloodBank.setPassword(passwordEncoder.encode(request.getPassword()));
        BloodBank savedBloodBank = bloodBankRepository.save(bloodBank);
        bloodBankInventoryService.initializeInventoryForBloodBank(savedBloodBank.getId());

        return buildAuthResponse(savedBloodBank);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        if (request.getAccountType() == Role.ADMIN) {
            throw new BadRequestException("Admin login is not supported yet");
        }

        String username = request.getAccountType() + ":" + request.getEmail();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getRole()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .build();
    }

    private AuthResponse buildAuthResponse(BaseAccount account) {
        String token = jwtUtil.generateToken(
                account.getId(),
                account.getEmail(),
                account.getRole()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(account.getId())
                .email(account.getEmail())
                .role(account.getRole())
                .build();
    }
}