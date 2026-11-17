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
@Schema(description = "Department Response")
public class DepartmentResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private int roomCount;
}
