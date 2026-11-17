package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.DiscountRequest;
import com.hospital.dto.InvoiceRequest;
import com.hospital.dto.InvoiceResponse;
import com.hospital.dto.PaymentRequest;
import com.hospital.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Billing and Invoice management APIs")
@SecurityRequirement(name = "bearerAuth")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    @Operation(summary = "Create or sync invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@RequestBody InvoiceRequest request) {
        InvoiceResponse response = billingService.createManualInvoice(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/invoices/sync/{examId}")
    @Operation(summary = "Synchronize examination lab tests and medications into invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> syncExaminationInvoice(@PathVariable Long examId) {
        return ResponseEntity.ok(ApiResponse.success(billingService.syncExaminationInvoiceById(examId)));
    }

    @PostMapping("/invoices/{id}/discount")
    @Operation(summary = "Apply BHYT or discount to invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> applyDiscount(
            @PathVariable Long id,
            @RequestBody DiscountRequest request) {
        return ResponseEntity.ok(ApiResponse.success(billingService.applyDiscount(id, request)));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        return ResponseEntity.ok(ApiResponse.success(billingService.getAllInvoices()));
    }

    @GetMapping("/invoices/unpaid")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getUnpaidInvoices() {
        return ResponseEntity.ok(ApiResponse.success(billingService.getUnpaidInvoices()));
    }

    @GetMapping("/invoices/my")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getMyInvoices(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getMyInvoices(authentication.getName())));
    }

    @GetMapping("/invoices/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getInvoicesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getInvoicesByPatient(patientId)));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getInvoiceById(id)));
    }

    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<ApiResponse<InvoiceResponse>> processPayment(
            @PathVariable Long id,
            @RequestBody PaymentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                billingService.processPayment(id, request, authentication != null ? authentication.getName() : null)));
    }

    @GetMapping("/invoices/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getInvoiceByAppointment(appointmentId)));
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getDailyRevenue(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getDailyRevenue(date)));
    }
}
