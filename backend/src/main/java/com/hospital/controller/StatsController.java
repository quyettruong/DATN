package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.service.StatsService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DOCTOR')")
@Tag(name = "Statistics", description = "Admin dashboard statistics")
@SecurityRequirement(name = "bearerAuth")
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getDashboardStats()));
    }

    @GetMapping("/revenue/weekly")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWeeklyRevenue() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getWeeklyRevenue()));
    }

    @GetMapping("/appointments/hourly")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHourlyAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(statsService.getHourlyAppointments(date)));
    }

    @GetMapping("/departments/stats")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDepartmentStats() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getDepartmentStats()));
    }
}
