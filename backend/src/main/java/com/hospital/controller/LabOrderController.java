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
@RequestMapping("/api/lab-orders")
@RequiredArgsConstructor
@Tag(name = "Lab Order", description = "Lab order management APIs")
@SecurityRequirement(name = "bearerAuth")
public class LabOrderController {

    private final LabOrderService labOrderService;

    @GetMapping
    @Operation(summary = "Get all lab orders")
    public ResponseEntity<ApiResponse<List<LabOrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(labOrderService.getAllOrders()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Create lab order")
    public ResponseEntity<ApiResponse<LabOrderResponse>> createLabOrder(
            @RequestParam Long examId, @RequestBody LabOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                labOrderService.createLabOrder(examId, request.getLabTestId(), request.getNotes())));
    }

    @GetMapping("/examination/{examId}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'DOCTOR', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get orders by examination")
    public ResponseEntity<ApiResponse<List<LabOrderResponse>>> getOrdersByExamination(@PathVariable Long examId) {
        return ResponseEntity.ok(ApiResponse.success(
                labOrderService.getOrdersByExamination(examId)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'DOCTOR', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get pending orders")
    public ResponseEntity<ApiResponse<List<LabOrderResponse>>> getPendingOrders() {
        return ResponseEntity.ok(ApiResponse.success(
                labOrderService.getOrdersByStatus("ORDERED")));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Start processing order")
    public ResponseEntity<ApiResponse<LabOrderResponse>> startProcessing(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                labOrderService.startProcessing(id, authentication.getName())));
    }

    @PostMapping("/{id}/result")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Submit result")
    public ResponseEntity<ApiResponse<LabOrderResponse>> submitResult(
            @PathVariable Long id, @RequestBody LabResultRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                labOrderService.submitResult(id, request)));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get completed orders for doctor")
    public ResponseEntity<ApiResponse<List<LabOrderResponse>>> getLabOrdersForDoctor(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                labOrderService.getLabOrdersForDoctor(authentication.getName())));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get my lab orders (Patient)")
    public ResponseEntity<ApiResponse<List<LabOrderResponse>>> getMyLabOrders(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                labOrderService.getMyLabOrders(authentication.getName())));
    }
}
