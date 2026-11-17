package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkInCheckInRequest {
    private Long roomId;
    private Long doctorId;
    private Long patientUserId;
    private String fullName;
    private String phone;
    private LocalDate dob;
    private String gender;
    private String address;
    private String reason;
    private int urgencyLevel;
}

