package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String category;
    private String normalRange;
    private String unit;
    private Double price;
    private Boolean active;
}
