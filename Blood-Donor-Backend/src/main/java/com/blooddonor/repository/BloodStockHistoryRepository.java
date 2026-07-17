package com.blooddonor.repository;

import com.blooddonor.entity.BloodStockHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BloodStockHistoryRepository extends JpaRepository<BloodStockHistory, Long> {
}
