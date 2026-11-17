package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String code;
    
    private String name;
    private String description;
    
    private String category; // BLOOD, URINE, IMAGING, OTHER
    private String normalRange;
    private String unit;
    private Double price;

    @Builder.Default
    private boolean active = true;
}
