package com.blooddonor.entity;

import com.blooddonor.validation.BloodType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "donors")
@Getter
@Setter
@NoArgsConstructor
public class Donor extends BaseAccount {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean blocked = false;

    private LocalDate lastDonationDate;
}
