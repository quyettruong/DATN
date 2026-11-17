package com.hospital.dto;

import com.hospital.entity.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User Response")
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private boolean enabled;
    private LocalDateTime createdAt;

    // Patient specific fields
    private String patientCode;
    private java.time.LocalDate dob;
    private String gender;
    private String address;
    private String allergies;
    private String medicalHistory;
    private String bloodType;
}
