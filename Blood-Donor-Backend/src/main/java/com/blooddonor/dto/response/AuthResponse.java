package com.blooddonor.dto.response;

import com.blooddonor.validation.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private Long id;
    private String email;
    private Role role;
}