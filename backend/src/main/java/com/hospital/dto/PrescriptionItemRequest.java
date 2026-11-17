package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemRequest {
    private Long medicationId; private String dosage; private String frequency; private String duration; private int quantity; private String instruction;
}
