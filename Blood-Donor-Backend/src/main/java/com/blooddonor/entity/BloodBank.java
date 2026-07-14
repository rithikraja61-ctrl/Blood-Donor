package com.blooddonor.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "blood_banks")
@Getter
@Setter
@NoArgsConstructor
public class BloodBank extends BaseAccount {
}