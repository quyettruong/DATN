package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "drug_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrugInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medication_a_id", nullable = false)
    private Medication medicationA;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medication_b_id", nullable = false)
    private Medication medicationB;

    @Column(nullable = false)
    private String severity; // CRITICAL, WARNING, INFO

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String clinicalAdvice;

    @Builder.Default
    private boolean active = true;
}
