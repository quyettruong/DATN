package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrugAlertItem {
    private String type; // ALLERGY, INTERACTION, DUPLICATE
    private String severity; // CRITICAL, WARNING, INFO
    private String title;
    private String medicationNames;
    private String description;
    private String clinicalAdvice;
}
