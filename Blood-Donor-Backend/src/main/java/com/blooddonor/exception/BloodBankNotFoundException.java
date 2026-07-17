package com.blooddonor.exception;

public class BloodBankNotFoundException extends ResourceNotFoundException {

    public BloodBankNotFoundException(String message) {
        super(message);
    }
}
