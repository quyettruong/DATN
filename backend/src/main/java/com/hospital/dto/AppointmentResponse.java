package com.hospital.dto;

import com.hospital.entity.enums.AppointmentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Appointment Response")
public class AppointmentResponse {
    private Long id;
    private String patientName;
    private String doctorName;
    private String departmentName;
    private String roomName;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private AppointmentStatus status;
    private String reason;
    private LocalDateTime createdAt;
}
