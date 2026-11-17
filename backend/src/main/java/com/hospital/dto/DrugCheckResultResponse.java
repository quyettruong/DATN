package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrugCheckResultResponse {
    private boolean hasCriticalAlert;
    private boolean hasWarningAlert;
    private int totalAlerts;
    @Builder.Default
    private List<DrugAlertItem> alerts = new ArrayList<>();
}
