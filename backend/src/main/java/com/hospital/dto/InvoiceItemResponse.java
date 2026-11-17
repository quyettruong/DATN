package com.hospital.dto;

import lombok.Data;

@Data
public class InvoiceItemResponse {
    private Long id;
    private String itemType;
    private String itemName;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
}
