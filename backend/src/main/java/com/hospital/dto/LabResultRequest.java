package com.hospital.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResultRequest {
    private String resultValue;
    private String resultText;
    private boolean isAbnormal;
    private String notes;
    private String attachmentUrl;
}
