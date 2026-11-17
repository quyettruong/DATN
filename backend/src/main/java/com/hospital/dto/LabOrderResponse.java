package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabOrderResponse {
    private Long id;
    private String testName;
    private String testCode;
    private String category;
    private Double price;
    private String unit;
    private String normalRange;
    private String patientName;
    private String patientCode;
    private String doctorName;
    private String status;
    private LocalDateTime orderedAt;
    private LocalDateTime verifiedAt;
    private String result;
    private String resultValue;
    private String resultText;
    private Boolean isAbnormal;
    private String notes;
    private String attachmentUrl;
}
