package com.blooddonor.exception;

public class BloodGroupNotFoundException extends BadRequestException {

    public BloodGroupNotFoundException(String message) {
        super(message);
    }
}
