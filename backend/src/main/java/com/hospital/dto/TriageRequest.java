package com.hospital.dto;

import com.hospital.entity.enums.TriageLevel;
import lombok.Data;

@Data
public class TriageRequest {
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer heartRate;
    private Double temperature;
    private Double weight;
    private Double height;
    private Integer spO2;
    private TriageLevel triageLevel;
}
