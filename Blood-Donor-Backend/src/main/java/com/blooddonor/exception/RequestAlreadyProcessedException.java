package com.blooddonor.exception;

public class RequestAlreadyProcessedException extends BadRequestException {

    public RequestAlreadyProcessedException(String message) {
        super(message);
    }
}
