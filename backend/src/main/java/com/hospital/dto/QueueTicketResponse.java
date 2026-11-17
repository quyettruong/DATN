package com.hospital.dto;

import com.hospital.entity.enums.QueueStatus;
import com.hospital.entity.enums.TriageLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Queue Ticket Response")
public class QueueTicketResponse {
    private Long id;
    private String queueNumber;
    private String patientName;
    private String patientCode;
    private String doctorName;
    private String roomName;
    private QueueStatus status;
    private TriageLevel triageLevel;
    private Boolean isWalkIn;
    private Boolean isReturnPatient;
    private String reason;
    private int priorityScore;
    private Integer estimatedWaitMinutes;
    private LocalDate queueDate;
    private LocalDateTime calledAt;
    private LocalDateTime createdAt;
}
