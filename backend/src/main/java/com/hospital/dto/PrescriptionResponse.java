package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {
    private Long id;
    private Long examinationId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private String patientCode;
    private String patientAllergies;
    private String patientBloodType;
    private String diagnosis;
    private String notes;
    private String status;
    private String invoiceStatus;
    private List<PrescriptionItemResponse> items;
    private LocalDateTime prescribedAt;
    private LocalDateTime createdAt;
}
