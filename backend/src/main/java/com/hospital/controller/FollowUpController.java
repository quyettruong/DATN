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
@RequestMapping("/api/follow-ups")
@RequiredArgsConstructor
@Tag(name = "Follow Up", description = "Follow up appointments APIs")
@SecurityRequirement(name = "bearerAuth")
public class FollowUpController {

    private final FollowUpService followUpService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Create follow up appointment")
    public ResponseEntity<ApiResponse<FollowUpResponse>> createFollowUp(
            @RequestParam Long examId, @RequestBody FollowUpRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                followUpService.createFollowUp(examId, request)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get follow ups by patient")
    public ResponseEntity<ApiResponse<List<FollowUpResponse>>> getFollowUpsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                followUpService.getFollowUpsByPatient(patientId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get my follow ups (Patient)")
    public ResponseEntity<ApiResponse<List<FollowUpResponse>>> getMyFollowUps(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                followUpService.getMyFollowUps(authentication.getName())));
    }
}
