package com.blooddonor.exception;

public class InsufficientBloodUnitsException extends BadRequestException {

    public InsufficientBloodUnitsException(String message) {
        super(message);
    }
}
