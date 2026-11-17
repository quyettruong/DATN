package com.hospital.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Doctor Response")
public class DoctorResponse {
    private Long id;
    private Long departmentId;
    private String fullName;
    private String specialization;
    private String departmentName;
    private String licenseNo;
    private String status;
}
