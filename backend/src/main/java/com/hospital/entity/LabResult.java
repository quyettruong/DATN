package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "lab_order_id")
    private LabOrder labOrder;

    private String resultValue;

    @Column(columnDefinition = "TEXT")
    private String resultText;

    @Builder.Default
    private boolean isAbnormal = false;

    private String attachmentUrl;

    @ManyToOne
    @JoinColumn(name = "performed_by_id")
    private User performedBy;

    private LocalDateTime verifiedAt;
    private String notes;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
