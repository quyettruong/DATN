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
@RequestMapping("/api/examinations")
@RequiredArgsConstructor
@Tag(name = "Examination", description = "Examination management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ExaminationController {

    private final ExaminationService examinationService;

    @PostMapping("/{ticketId}/start")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Start examination")
    public ResponseEntity<ApiResponse<ExaminationResponse>> startExamination(
            @PathVariable Long ticketId, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                examinationService.startExamination(ticketId, authentication.getName())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update examination")
    public ResponseEntity<ApiResponse<ExaminationResponse>> updateExamination(
            @PathVariable Long id, @RequestBody ExaminationUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                examinationService.updateExamination(id, request)));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Complete examination")
    public ResponseEntity<ApiResponse<ExaminationResponse>> completeExamination(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                examinationService.completeExamination(id)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get examination details")
    public ResponseEntity<ApiResponse<ExaminationResponse>> getExamination(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                examinationService.getExamination(id)));
    }

    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get examination by ticket")
    public ResponseEntity<ApiResponse<ExaminationResponse>> getExaminationByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ApiResponse.success(
                examinationService.getExaminationByTicket(ticketId)));
    }

    @GetMapping("/patient/{patientId}/history")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get patient history")
    public ResponseEntity<ApiResponse<List<ExaminationResponse>>> getPatientHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                examinationService.getPatientHistory(patientId)));
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<ExaminationResponse>>> getMyHistory(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                examinationService.getMyHistory(authentication.getName())));
    }
}
