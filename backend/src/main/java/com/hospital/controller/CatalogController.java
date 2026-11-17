package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.entity.LabTest;
import com.hospital.entity.Medication;
import com.hospital.repository.LabTestRepository;
import com.hospital.repository.MedicationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
@Tag(name = "Catalog", description = "Catalog APIs for lab tests and medications")
@SecurityRequirement(name = "bearerAuth")
public class CatalogController {

    private final LabTestRepository labTestRepository;
    private final MedicationRepository medicationRepository;

    @GetMapping("/lab-tests")
    @Operation(summary = "Get all active lab tests")
    public ResponseEntity<ApiResponse<List<LabTestResponse>>> getActiveLabTests() {
        return ResponseEntity.ok(ApiResponse.success(
                labTestRepository.findByActiveTrue().stream().map(this::mapLab).collect(Collectors.toList())));
    }

    @GetMapping("/lab-tests/category/{category}")
    @Operation(summary = "Get lab tests by category")
    public ResponseEntity<ApiResponse<List<LabTestResponse>>> getLabTestsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(
                labTestRepository.findByCategory(category.toUpperCase()).stream()
                        .filter(LabTest::isActive)
                        .map(this::mapLab)
                        .collect(Collectors.toList())));
    }

    @GetMapping("/medications")
    @Operation(summary = "Get all active medications")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> getActiveMedications() {
        return ResponseEntity.ok(ApiResponse.success(
                medicationRepository.findByActiveTrue().stream().map(this::mapMed).collect(Collectors.toList())));
    }

    @GetMapping("/medications/search")
    @Operation(summary = "Search medications")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> searchMedications(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(
                medicationRepository.findByNameContainingIgnoreCase(q).stream()
                        .filter(Medication::isActive)
                        .map(this::mapMed)
                        .collect(Collectors.toList())));
    }

    @PostMapping("/medications")
    @Operation(summary = "Create medication (Admin)")
    public ResponseEntity<ApiResponse<MedicationResponse>> createMedication(@RequestBody java.util.Map<String, String> body) {
        String code = body.get("code");
        String name = body.get("name");
        if (code == null || code.trim().isEmpty() || name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã thuốc và tên thuốc không được để trống."));
        }

        code = code.trim().toUpperCase();
        if (medicationRepository.findByCode(code).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã thuốc '" + code + "' đã tồn tại trong danh mục."));
        }

        Medication med = Medication.builder()
                .code(code)
                .name(name.trim())
                .genericName(body.get("genericName") != null ? body.get("genericName").trim() : "")
                .dosageForm(body.get("dosageForm") != null ? body.get("dosageForm").trim() : "TABLET")
                .strength(body.get("strength") != null ? body.get("strength").trim() : "")
                .unit(body.get("unit") != null ? body.get("unit").trim() : "Viên")
                .manufacturer(body.get("manufacturer") != null ? body.get("manufacturer").trim() : "")
                .active(true)
                .build();
        med = medicationRepository.save(med);
        return ResponseEntity.ok(ApiResponse.success(mapMed(med)));
    }

    @PutMapping("/medications/{id}")
    @Operation(summary = "Update medication (Admin)")
    public ResponseEntity<ApiResponse<MedicationResponse>> updateMedication(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        Medication med = medicationRepository.findById(id)
                .orElseThrow(() -> new com.hospital.exception.ResourceNotFoundException("Không tìm thấy thuốc ID: " + id));

        if (body.containsKey("name") && body.get("name") != null && !body.get("name").trim().isEmpty()) {
            med.setName(body.get("name").trim());
        }
        if (body.containsKey("genericName")) {
            med.setGenericName(body.get("genericName") != null ? body.get("genericName").trim() : "");
        }
        if (body.containsKey("dosageForm")) {
            med.setDosageForm(body.get("dosageForm") != null ? body.get("dosageForm").trim() : med.getDosageForm());
        }
        if (body.containsKey("strength")) {
            med.setStrength(body.get("strength") != null ? body.get("strength").trim() : "");
        }
        if (body.containsKey("unit")) {
            med.setUnit(body.get("unit") != null ? body.get("unit").trim() : med.getUnit());
        }
        if (body.containsKey("manufacturer")) {
            med.setManufacturer(body.get("manufacturer") != null ? body.get("manufacturer").trim() : "");
        }
        if (body.containsKey("code") && body.get("code") != null && !body.get("code").trim().isEmpty()) {
            String newCode = body.get("code").trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(med.getCode()) && medicationRepository.findByCode(newCode).isPresent()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Mã thuốc '" + newCode + "' đã tồn tại."));
            }
            med.setCode(newCode);
        }

        med = medicationRepository.save(med);
        return ResponseEntity.ok(ApiResponse.success(mapMed(med)));
    }

    @DeleteMapping("/medications/{id}")
    @Operation(summary = "Delete / Deactivate medication (Admin)")
    public ResponseEntity<ApiResponse<String>> deleteMedication(@PathVariable Long id) {
        Medication med = medicationRepository.findById(id)
                .orElseThrow(() -> new com.hospital.exception.ResourceNotFoundException("Không tìm thấy thuốc ID: " + id));
        med.setActive(false);
        medicationRepository.save(med);
        return ResponseEntity.ok(ApiResponse.success("Đã ngừng hoạt động thuốc thành công."));
    }

    @PostMapping("/lab-tests")
    @Operation(summary = "Create lab test (Admin)")
    public ResponseEntity<ApiResponse<LabTestResponse>> createLabTest(@RequestBody java.util.Map<String, Object> body) {
        String code = body.get("code") != null ? body.get("code").toString() : null;
        String name = body.get("name") != null ? body.get("name").toString() : null;
        if (code == null || code.trim().isEmpty() || name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã và tên xét nghiệm không được để trống."));
        }

        code = code.trim().toUpperCase();
        if (labTestRepository.findByCode(code).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã xét nghiệm '" + code + "' đã tồn tại."));
        }

        Double price = null;
        if (body.get("price") != null) {
            try {
                price = Double.parseDouble(body.get("price").toString());
            } catch (Exception ignored) {}
        }

        LabTest test = LabTest.builder()
                .code(code)
                .name(name.trim())
                .description(body.get("description") != null ? body.get("description").toString().trim() : "")
                .category(body.get("category") != null ? body.get("category").toString().trim().toUpperCase() : "BLOOD")
                .normalRange(body.get("normalRange") != null ? body.get("normalRange").toString().trim() : "")
                .unit(body.get("unit") != null ? body.get("unit").toString().trim() : "")
                .price(price != null ? price : 150000.0)
                .active(true)
                .build();
        test = labTestRepository.save(test);
        return ResponseEntity.ok(ApiResponse.success(mapLab(test)));
    }

    @PutMapping("/lab-tests/{id}")
    @Operation(summary = "Update lab test (Admin)")
    public ResponseEntity<ApiResponse<LabTestResponse>> updateLabTest(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> body) {
        LabTest test = labTestRepository.findById(id)
                .orElseThrow(() -> new com.hospital.exception.ResourceNotFoundException("Không tìm thấy xét nghiệm ID: " + id));

        if (body.containsKey("name") && body.get("name") != null && !body.get("name").toString().trim().isEmpty()) {
            test.setName(body.get("name").toString().trim());
        }
        if (body.containsKey("description")) {
            test.setDescription(body.get("description") != null ? body.get("description").toString().trim() : "");
        }
        if (body.containsKey("category") && body.get("category") != null) {
            test.setCategory(body.get("category").toString().trim().toUpperCase());
        }
        if (body.containsKey("normalRange")) {
            test.setNormalRange(body.get("normalRange") != null ? body.get("normalRange").toString().trim() : "");
        }
        if (body.containsKey("unit")) {
            test.setUnit(body.get("unit") != null ? body.get("unit").toString().trim() : "");
        }
        if (body.containsKey("price") && body.get("price") != null) {
            try {
                test.setPrice(Double.parseDouble(body.get("price").toString()));
            } catch (Exception ignored) {}
        }
        if (body.containsKey("code") && body.get("code") != null && !body.get("code").toString().trim().isEmpty()) {
            String newCode = body.get("code").toString().trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(test.getCode()) && labTestRepository.findByCode(newCode).isPresent()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Mã xét nghiệm '" + newCode + "' đã tồn tại."));
            }
            test.setCode(newCode);
        }

        test = labTestRepository.save(test);
        return ResponseEntity.ok(ApiResponse.success(mapLab(test)));
    }

    @DeleteMapping("/lab-tests/{id}")
    @Operation(summary = "Delete / Deactivate lab test (Admin)")
    public ResponseEntity<ApiResponse<String>> deleteLabTest(@PathVariable Long id) {
        LabTest test = labTestRepository.findById(id)
                .orElseThrow(() -> new com.hospital.exception.ResourceNotFoundException("Không tìm thấy xét nghiệm ID: " + id));
        test.setActive(false);
        labTestRepository.save(test);
        return ResponseEntity.ok(ApiResponse.success("Đã ngừng hoạt động xét nghiệm thành công."));
    }

    private LabTestResponse mapLab(LabTest l) {
        return LabTestResponse.builder()
                .id(l.getId())
                .code(l.getCode())
                .name(l.getName())
                .description(l.getDescription())
                .category(l.getCategory())
                .normalRange(l.getNormalRange())
                .unit(l.getUnit())
                .price(l.getPrice())
                .active(l.isActive())
                .build();
    }
    
    private MedicationResponse mapMed(Medication m) {
        return MedicationResponse.builder()
                .id(m.getId())
                .code(m.getCode())
                .name(m.getName())
                .genericName(m.getGenericName())
                .dosageForm(m.getDosageForm())
                .strength(m.getStrength())
                .unit(m.getUnit())
                .manufacturer(m.getManufacturer())
                .active(m.isActive())
                .build();
    }
}