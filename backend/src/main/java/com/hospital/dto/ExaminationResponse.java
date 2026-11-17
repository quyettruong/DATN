package com.hospital.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExaminationResponse {
    private Long id; 
    private Long patientId; 
    private String patientName; 
    private String patientCode; 
    private String patientGender;
    private LocalDate patientDob;
    private String patientAllergies;
    private String patientMedicalHistory;
    private String patientBloodType;
    private String doctorName; 
    private String symptoms; 
    private String diagnosis; 
    private String notes; 
    private String conclusion; 
    private String bloodPressure; 
    private Integer heartRate; 
    private Double temperature; 
    private Double weight; 
    private Double height; 
    private Integer spO2;
    private String triageLevel;
    private String vitals; 
    private List<LabOrderResponse> labOrders; 
    private List<PrescriptionResponse> prescriptions; 
    private Long queueTicketId;
    private Long appointmentId;
    private LocalDateTime startedAt; 
    private LocalDateTime endedAt;
}
