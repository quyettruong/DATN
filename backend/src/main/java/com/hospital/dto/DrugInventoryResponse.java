package com.hospital.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DrugInventoryResponse {
    private Long id;
    private Long medicationId;
    private String medicationName;
    private String genericName;
    private String dosageForm;
    private String strength;
    private String lotNumber;
    private LocalDate expiryDate;
    private Integer stockQuantity;
    private Integer reorderLevel;
    private Boolean isLowStock;   // stockQuantity <= reorderLevel
    private Boolean isExpiringSoon; // expiryDate within 30 days
    private Double sellingPrice;
}
