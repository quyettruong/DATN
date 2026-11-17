package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(unique = true, nullable = false)
    private String code;

    private String name;
    private String type;

    @Builder.Default
    private String status = "ACTIVE";

    @Builder.Default
    private int capacity = 1;
}
