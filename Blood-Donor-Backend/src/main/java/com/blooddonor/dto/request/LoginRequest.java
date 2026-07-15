package com.blooddonor.dto.request;

import com.blooddonor.validation.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
public class LoginRequest {
    

    @NotNull(message = "Account type is required")
    private Role accountType;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}