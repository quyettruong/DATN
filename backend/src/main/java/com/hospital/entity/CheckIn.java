package com.hospital.entity;

import com.hospital.entity.enums.CheckInStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "check_ins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    private LocalDateTime checkedInAt;
    
    @Builder.Default
    private String method = "COUNTER";

    @Enumerated(EnumType.STRING)
    private CheckInStatus status;

    private Integer bloodPressureSystolic;   // 120
    private Integer bloodPressureDiastolic;  // 80
    private Integer heartRate;               // bpm
    private Double temperature;              // Celsius
    private Double weight;                   // kg
    private Double height;                   // cm
    private Integer spO2;                    // oxygen saturation %

    @Enumerated(EnumType.STRING)
    private com.hospital.entity.enums.TriageLevel triageLevel;         // ESI level

    private LocalDateTime triagedAt;         // when triage done
    private String triagedByUsername;        // who did triage
}
