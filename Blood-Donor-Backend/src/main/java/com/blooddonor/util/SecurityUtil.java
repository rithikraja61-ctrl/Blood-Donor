package com.blooddonor.util;

import com.blooddonor.exception.UnauthorizedException;
import com.blooddonor.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    public CustomUserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new UnauthorizedException("User not authenticated");
        }

        return userDetails;
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}