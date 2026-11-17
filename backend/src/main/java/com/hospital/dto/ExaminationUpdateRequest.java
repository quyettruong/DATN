package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExaminationUpdateRequest {
    private String symptoms; private String diagnosis; private String notes; private String conclusion; private String bloodPressure; private Integer heartRate; private Double temperature; private Double weight; private Double height;
}
