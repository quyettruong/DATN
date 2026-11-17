package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.DrugInventoryResponse;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.service.PharmacyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacy")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Pharmacy", description = "Pharmacy and Inventory management APIs")
@SecurityRequirement(name = "bearerAuth")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/prescriptions")
    @Operation(summary = "Get all prescriptions for pharmacy dispensing")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPrescriptionsForPharmacy() {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.getPrescriptionsForPharmacy()));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<DrugInventoryResponse>>> getAllInventory() {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.getAllInventory()));
    }

    @GetMapping("/inventory/low-stock")
    public ResponseEntity<ApiResponse<List<DrugInventoryResponse>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.getLowStockAlerts()));
    }

    @GetMapping("/inventory/expiring")
    public ResponseEntity<ApiResponse<List<DrugInventoryResponse>>> getExpiringSoonAlerts() {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.getExpiringSoonAlerts()));
    }

    @PostMapping("/inventory")
    public ResponseEntity<ApiResponse<DrugInventoryResponse>> addStock(
            @RequestParam Long medicationId,
            @RequestParam String lotNumber,
            @RequestParam LocalDate expiryDate,
            @RequestParam Integer quantity,
            @RequestParam Double costPrice,
            @RequestParam Double sellingPrice) {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.addStock(medicationId, lotNumber, expiryDate, quantity, costPrice, sellingPrice)));
    }

    @PostMapping("/prescriptions/{id}/dispense")
    @Operation(summary = "Dispense prescription using FEFO stock deduction")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> dispensePrescription(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.dispensePrescription(id)));
    }

    @GetMapping("/prescriptions/{id}/stock-check")
    public ResponseEntity<ApiResponse<Map<Long, Integer>>> checkStockAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.checkStockAvailability(id)));
    }
}
