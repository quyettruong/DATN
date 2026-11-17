package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String code;
    
    private String name;
    private String genericName;
    
    private String dosageForm; // TABLET, CAPSULE, INJECTION, SYRUP, CREAM, OTHER
    private String strength;
    private String unit;
    private String manufacturer;

    @Builder.Default
    private boolean active = true;
}
