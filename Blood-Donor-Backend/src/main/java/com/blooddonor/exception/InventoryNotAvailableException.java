package com.blooddonor.exception;

public class InventoryNotAvailableException extends BadRequestException {

    public InventoryNotAvailableException(String message) {
        super(message);
    }
}
