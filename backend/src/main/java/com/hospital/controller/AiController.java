package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.service.AiIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Predictions", description = "Kaggle-trained Python AI integration endpoints")
public class AiController {

    private final AiIntegrationService aiIntegrationService;

    @GetMapping("/health")
    @Operation(summary = "Check Python AI microservice status and Kaggle model metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        return ResponseEntity.ok(ApiResponse.success(aiIntegrationService.getAiHealth()));
    }

    @PostMapping("/predict/symptom")
    @Operation(summary = "Predict disease and recommended department from symptom description")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictSymptom(@RequestBody Map<String, String> body) {
        String text = body != null ? body.getOrDefault("symptomText", body.getOrDefault("symptom_text", "")) : "";
        return ResponseEntity.ok(ApiResponse.success(aiIntegrationService.predictSymptomSpecialty(text)));
    }

    @GetMapping("/appointments/{appointmentId}/no-show")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN', 'DOCTOR')")
    @Operation(summary = "Predict No-Show probability for a scheduled appointment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictAppointmentNoShow(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(aiIntegrationService.predictNoShowForAppointment(appointmentId)));
    }

    @PostMapping("/predict/no-show")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN', 'DOCTOR')")
    @Operation(summary = "Run No-Show prediction on custom patient/appointment features")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictNoShow(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(ApiResponse.success(aiIntegrationService.predictNoShowRaw(payload)));
    }
}
