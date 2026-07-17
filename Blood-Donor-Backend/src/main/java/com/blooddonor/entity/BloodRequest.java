package com.blooddonor.entity;

import com.blooddonor.validation.BloodRequestStatus;
import com.blooddonor.validation.BloodType;
import com.blooddonor.validation.EmergencyLevel;
import com.blooddonor.validation.Gender;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "blood_requests")
@Getter
@Setter
@NoArgsConstructor
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private int patientAge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender patientGender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType requiredBloodGroup;

    @Column(nullable = false)
    private int unitsOfBloodRequired;

    @Column(nullable = false, length = 1000)
    private String reasonForBloodRequirement;

    @Column(nullable = false)
    private String hospitalName;

    @Column(nullable = false)
    private String hospitalAddress;

    @Column(nullable = false)
    private String hospitalCity;

    @Column(nullable = false, length = 6)
    private String hospitalPinCode;

    @Column(nullable = false)
    private String contactPersonName;

    @Column(nullable = false)
    private String contactPhoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmergencyLevel emergencyLevel;

    @Column(nullable = false)
    private LocalDateTime requiredBeforeDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodRequestStatus status = BloodRequestStatus.PENDING;

    private LocalDateTime respondedAt;
    private LocalDateTime completedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
