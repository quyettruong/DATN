package com.hospital.entity;

import com.hospital.entity.enums.LabOrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "examination_id")
    private Examination examination;

    @ManyToOne
    @JoinColumn(name = "lab_test_id")
    private LabTest labTest;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LabOrderStatus status = LabOrderStatus.ORDERED;

    private LocalDateTime orderedAt;
    private String notes;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (orderedAt == null) orderedAt = LocalDateTime.now();
    }
}
