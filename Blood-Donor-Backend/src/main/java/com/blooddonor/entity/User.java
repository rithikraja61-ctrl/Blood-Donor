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

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseAccount {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;
}