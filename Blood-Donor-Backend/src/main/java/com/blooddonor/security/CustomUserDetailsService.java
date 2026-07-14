package com.blooddonor.security;

import com.blooddonor.entity.BaseAccount;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.DonorRepository;
import com.blooddonor.repository.HospitalRepository;
import com.blooddonor.repository.UserRepository;
import com.blooddonor.validation.Role;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;

    public CustomUserDetailsService(
            UserRepository userRepository,
            DonorRepository donorRepository,
            HospitalRepository hospitalRepository,
            BloodBankRepository bloodBankRepository) {
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        String[] parts = username.split(":", 2);
        if (parts.length != 2) {
            throw new UsernameNotFoundException("Invalid username format");
        }

        Role role = Role.valueOf(parts[0]);
        String email = parts[1];

        BaseAccount account = switch (role) {
            case USER -> userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            case DONOR -> donorRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Donor not found"));
            case HOSPITAL -> hospitalRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Hospital not found"));
            case BLOOD_BANK -> bloodBankRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Blood bank not found"));
            case ADMIN -> throw new UsernameNotFoundException("Admin login not supported yet");
        };

        return new CustomUserDetails(
                account.getId(),
                account.getEmail(),
                account.getPassword(),
                account.getRole()
        );
    }
}