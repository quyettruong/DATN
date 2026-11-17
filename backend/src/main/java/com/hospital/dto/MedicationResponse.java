package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationResponse {
    private Long id;
    private String code;
    private String name;
    private String genericName;
    private String dosageForm;
    private String strength;
    private String unit;
    private String manufacturer;
    private Boolean active;
}
