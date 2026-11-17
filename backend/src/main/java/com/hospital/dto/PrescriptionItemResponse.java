package com.hospital.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemResponse {
    private Long id;
    private Long medicationId;
    private String medicationName;
    private String dosageForm;
    private String dosage;
    private String frequency;
    private String duration;
    private int quantity;
    private String instruction;
    private Integer availableStock;
    private Double unitPrice;
}
