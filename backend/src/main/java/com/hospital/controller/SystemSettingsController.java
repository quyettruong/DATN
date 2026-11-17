package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.service.SystemSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "Hospital system settings and live queue mode configuration")
@SecurityRequirement(name = "bearerAuth")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    @GetMapping
    @Operation(summary = "Get current system settings")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingsService.getAllSettings()));
    }

    @PutMapping
    @Operation(summary = "Update system settings and apply queue mode immediately")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateSettings(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(ApiResponse.success(systemSettingsService.updateSettings(request)));
    }
}
