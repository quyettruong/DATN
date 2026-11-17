package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescription", description = "Prescription management APIs")
@SecurityRequirement(name = "bearerAuth")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final DrugAlertService drugAlertService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get prescriptions for current doctor or staff/admin")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPrescriptions(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                prescriptionService.getPrescriptionsForUser(authentication.getName())));
    }

    @PostMapping("/check-interactions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    @Operation(summary = "Check drug interactions, duplicate ingredients, and patient allergies")
    public ResponseEntity<ApiResponse<DrugCheckResultResponse>> checkInteractions(
            @RequestBody DrugCheckRequest request) {
        return ResponseEntity.ok(ApiResponse.success(drugAlertService.checkDrugs(request)));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create or update prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
            @RequestParam Long examId, @RequestBody PrescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                prescriptionService.createPrescription(examId, request)));
    }

    @GetMapping("/examination/{examId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get prescriptions by examination")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPrescriptionsByExamination(@PathVariable Long examId) {
        return ResponseEntity.ok(ApiResponse.success(
                prescriptionService.getPrescriptionsByExamination(examId)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get prescriptions by patient")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                prescriptionService.getPrescriptionsByPatient(patientId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getMyPrescriptions(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                prescriptionService.getMyPrescriptions(authentication.getName())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN', 'PATIENT')")
    @Operation(summary = "Get prescription details")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescription(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                prescriptionService.getPrescription(id, authentication != null ? authentication.getName() : null)));
    }
}
