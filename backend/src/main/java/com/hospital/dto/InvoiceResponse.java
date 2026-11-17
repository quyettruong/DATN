package com.hospital.dto;

import com.hospital.entity.enums.InvoiceStatus;
import com.hospital.entity.enums.PaymentMethod;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private String patientName;
    private String patientCode;
    private Long patientId;
    private Long appointmentId;
    private Long examinationId;
    private Double consultationFee;
    private Double labFee;
    private Double medicationFee;
    private Double discountAmount;
    private Double totalAmount;
    private Double paidAmount;
    private Double remainingAmount;
    private InvoiceStatus status;
    private PaymentMethod paymentMethod;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String notes;
    private List<InvoiceItemResponse> items;
}
