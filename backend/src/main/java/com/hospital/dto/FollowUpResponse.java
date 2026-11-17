package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUpResponse {
    private Long id; private String patientName; private String doctorName; private LocalDate scheduledDate; private String notes; private String status;
}
