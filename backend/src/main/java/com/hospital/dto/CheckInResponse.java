package com.hospital.dto;

import com.hospital.entity.enums.TriageLevel;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CheckInResponse {
    private Long id;
    private Long appointmentId;
    private String patientName;
    private String patientCode;
    private String queueNumber;
    private TriageLevel triageLevel;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer heartRate;
    private Double temperature;
    private Double weight;
    private Double height;
    private Integer spO2;
    private LocalDateTime checkedInAt;
    private LocalDateTime triagedAt;
    private String status;
}
