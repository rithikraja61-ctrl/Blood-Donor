package com.blooddonor.service.impl;

import com.blooddonor.dto.request.BloodInventoryUpdateRequest;
import com.blooddonor.dto.request.BloodStockAdjustRequest;
import com.blooddonor.dto.response.BloodInventoryResponse;
import com.blooddonor.entity.BloodBank;
import com.blooddonor.entity.BloodInventory;
import com.blooddonor.entity.BloodStockHistory;
import com.blooddonor.exception.BloodBankNotFoundException;
import com.blooddonor.exception.BloodGroupNotFoundException;
import com.blooddonor.exception.InsufficientBloodUnitsException;
import com.blooddonor.exception.InventoryNotAvailableException;
import com.blooddonor.mapper.BloodBankModuleMapper;
import com.blooddonor.repository.BloodBankRepository;
import com.blooddonor.repository.BloodInventoryRepository;
import com.blooddonor.repository.BloodStockHistoryRepository;
import com.blooddonor.service.BloodBankInventoryService;
import com.blooddonor.util.SecurityUtil;
import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.StockHistoryChangeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class BloodBankInventoryServiceImpl implements BloodBankInventoryService {

    private final BloodBankRepository bloodBankRepository;
    private final BloodInventoryRepository bloodInventoryRepository;
    private final BloodStockHistoryRepository bloodStockHistoryRepository;
    private final BloodBankModuleMapper bloodBankModuleMapper;
    private final SecurityUtil securityUtil;

    public BloodBankInventoryServiceImpl(
            BloodBankRepository bloodBankRepository,
            BloodInventoryRepository bloodInventoryRepository,
            BloodStockHistoryRepository bloodStockHistoryRepository,
            BloodBankModuleMapper bloodBankModuleMapper,
            SecurityUtil securityUtil) {
        this.bloodBankRepository = bloodBankRepository;
        this.bloodInventoryRepository = bloodInventoryRepository;
        this.bloodStockHistoryRepository = bloodStockHistoryRepository;
        this.bloodBankModuleMapper = bloodBankModuleMapper;
        this.securityUtil = securityUtil;
    }

    @Override
    @Transactional
    public List<BloodInventoryResponse> getInventory() {
        BloodBank bloodBank = findCurrentBloodBank();
        ensureDefaultInventory(bloodBank);
        return bloodInventoryRepository.findByBloodBankIdOrderByBloodGroupAsc(bloodBank.getId())
                .stream()
                .map(bloodBankModuleMapper::toInventoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public BloodInventoryResponse updateInventory(BloodInventoryUpdateRequest request) {
        BloodBank bloodBank = findCurrentBloodBank();
        BloodType bloodType = resolveBloodType(request.getBloodGroup());
        BloodInventory inventory = getOrCreateInventory(bloodBank, bloodType);

        if (request.getExpiryDate() != null && request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new InventoryNotAvailableException("Expiry date must be today or in the future");
        }

        inventory.setAvailableUnits(request.getAvailableUnits());
        inventory.setReservedUnits(request.getReservedUnits());
        if (request.getExpiryDate() != null) {
            inventory.setExpiryDate(request.getExpiryDate());
        }

        BloodInventory saved = bloodInventoryRepository.save(inventory);
        recordHistory(bloodBank, bloodType, StockHistoryChangeType.ADJUSTMENT, 0,
                saved.getAvailableUnits(), null, "Manual inventory update");
        return bloodBankModuleMapper.toInventoryResponse(saved);
    }

    @Override
    @Transactional
    public BloodInventoryResponse increaseStock(BloodStockAdjustRequest request) {
        BloodBank bloodBank = findCurrentBloodBank();
        BloodType bloodType = resolveBloodType(request.getBloodGroup());
        BloodInventory inventory = getOrCreateInventory(bloodBank, bloodType);

        if (request.getExpiryDate() != null) {
            inventory.setExpiryDate(request.getExpiryDate());
        }

        inventory.setAvailableUnits(inventory.getAvailableUnits() + request.getUnits());
        BloodInventory saved = bloodInventoryRepository.save(inventory);
        recordHistory(bloodBank, bloodType, StockHistoryChangeType.INCREASE, request.getUnits(),
                saved.getAvailableUnits(), null, "Stock increase");
        return bloodBankModuleMapper.toInventoryResponse(saved);
    }

    @Override
    @Transactional
    public BloodInventoryResponse decreaseStock(BloodStockAdjustRequest request) {
        BloodBank bloodBank = findCurrentBloodBank();
        BloodType bloodType = resolveBloodType(request.getBloodGroup());
        BloodInventory inventory = getOrCreateInventory(bloodBank, bloodType);

        if (inventory.getAvailableUnits() < request.getUnits()) {
            throw new InsufficientBloodUnitsException(
                    "Insufficient available units for " + bloodType.getDisplayName());
        }

        inventory.setAvailableUnits(inventory.getAvailableUnits() - request.getUnits());
        BloodInventory saved = bloodInventoryRepository.save(inventory);
        recordHistory(bloodBank, bloodType, StockHistoryChangeType.DECREASE, request.getUnits(),
                saved.getAvailableUnits(), null, "Stock decrease");
        return bloodBankModuleMapper.toInventoryResponse(saved);
    }

    @Override
    @Transactional
    public void issueUnits(Long bloodBankId, String bloodGroup, int units, Long requestId) {
        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));
        BloodType bloodType = resolveBloodType(bloodGroup);
        issueUnitsInternal(bloodBank, bloodType, units, requestId);
    }

    @Transactional
    BloodInventory issueUnitsInternal(BloodBank bloodBank, BloodType bloodType, int units, Long requestId) {
        BloodInventory inventory = bloodInventoryRepository
                .findByBloodBankIdAndBloodGroup(bloodBank.getId(), bloodType)
                .orElseThrow(() -> new InventoryNotAvailableException(
                        "No inventory record for blood group " + bloodType.getDisplayName()));

        if (inventory.getExpiryDate() != null && inventory.getExpiryDate().isBefore(LocalDate.now())) {
            throw new InventoryNotAvailableException(
                    "Blood stock for " + bloodType.getDisplayName() + " has expired");
        }

        if (inventory.getAvailableUnits() < units) {
            throw new InsufficientBloodUnitsException(
                    "Insufficient available units for " + bloodType.getDisplayName());
        }

        inventory.setAvailableUnits(inventory.getAvailableUnits() - units);
        inventory.setIssuedUnits(inventory.getIssuedUnits() + units);
        BloodInventory saved = bloodInventoryRepository.save(inventory);
        recordHistory(bloodBank, bloodType, StockHistoryChangeType.ISSUE, units,
                saved.getAvailableUnits(), requestId, "Blood issued for hospital request");
        return saved;
    }

    private void ensureDefaultInventory(BloodBank bloodBank) {
        Arrays.stream(BloodType.values()).forEach(type -> getOrCreateInventory(bloodBank, type));
    }

    private BloodInventory getOrCreateInventory(BloodBank bloodBank, BloodType bloodType) {
        return bloodInventoryRepository.findByBloodBankIdAndBloodGroup(bloodBank.getId(), bloodType)
                .orElseGet(() -> {
                    BloodInventory inventory = new BloodInventory();
                    inventory.setBloodBank(bloodBank);
                    inventory.setBloodGroup(bloodType);
                    inventory.setAvailableUnits(0);
                    inventory.setReservedUnits(0);
                    inventory.setIssuedUnits(0);
                    return bloodInventoryRepository.save(inventory);
                });
    }

    private BloodType resolveBloodType(String bloodGroup) {
        try {
            return BloodType.fromDisplay(bloodGroup);
        } catch (RuntimeException ex) {
            throw new BloodGroupNotFoundException(ex.getMessage());
        }
    }

    private void recordHistory(
            BloodBank bloodBank,
            BloodType bloodType,
            StockHistoryChangeType changeType,
            int unitsChanged,
            int availableAfter,
            Long referenceId,
            String notes) {
        BloodStockHistory history = new BloodStockHistory();
        history.setBloodBank(bloodBank);
        history.setBloodGroup(bloodType);
        history.setChangeType(changeType);
        history.setUnitsChanged(unitsChanged);
        history.setAvailableUnitsAfter(availableAfter);
        history.setReferenceId(referenceId);
        history.setNotes(notes);
        bloodStockHistoryRepository.save(history);
    }

    private BloodBank findCurrentBloodBank() {
        Long bloodBankId = securityUtil.getCurrentUserId();
        return bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));
    }

    @Override
    @Transactional
    public void initializeInventoryForBloodBank(Long bloodBankId) {
        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new BloodBankNotFoundException("Blood bank not found"));
        ensureDefaultInventory(bloodBank);
    }
}
