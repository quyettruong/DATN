package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequest {
    private Long patientId;
    private String patientCode;
    private String patientName;
    private String patientPhone;
    private Long appointmentId;
    private Long examinationId;
    private Double consultationFee;
    private Double labFee;
    private Double medicationFee;
    private Double discountAmount;
    private String notes;
}
