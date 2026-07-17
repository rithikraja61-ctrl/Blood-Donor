package com.blooddonor.entity;

import jakarta.persistence.Column;
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

    @Column(nullable = false)
    private String city = "";

    @Column(nullable = false)
    private String state = "";

    @Column(nullable = false)
    private String licenseNumber = "";

    @Column(length = 512)
    private String profileImageUrl;
}