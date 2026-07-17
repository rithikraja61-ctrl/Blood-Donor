package com.blooddonor.service;

import com.blooddonor.dto.request.BloodInventoryUpdateRequest;
import com.blooddonor.dto.request.BloodStockAdjustRequest;
import com.blooddonor.dto.response.BloodInventoryResponse;

import java.util.List;

public interface BloodBankInventoryService {

    List<BloodInventoryResponse> getInventory();

    BloodInventoryResponse updateInventory(BloodInventoryUpdateRequest request);

    BloodInventoryResponse increaseStock(BloodStockAdjustRequest request);

    BloodInventoryResponse decreaseStock(BloodStockAdjustRequest request);

    void issueUnits(Long bloodBankId, String bloodGroup, int units, Long requestId);

    void initializeInventoryForBloodBank(Long bloodBankId);
}
