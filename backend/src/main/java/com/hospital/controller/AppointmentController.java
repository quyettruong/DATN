package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.service.AppointmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping({"", "/"})
    @PreAuthorize("hasAnyRole('PATIENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            Authentication authentication,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.createAppointment(authentication.getName(), request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAllAppointments(date)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'STAFF', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getAppointmentById(id, authentication != null ? authentication.getName() : null)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('PATIENT', 'STAFF', 'ADMIN', 'DOCTOR', 'LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getMyAppointments(authentication.getName())));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByDoctor(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByDoctor(authentication.getName(), date)));
    }

    @RequestMapping(value = "/{id}/cancel", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('PATIENT', 'STAFF', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.cancelAppointment(id, authentication.getName())));
    }

    @RequestMapping(value = "/{id}/confirm", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.confirmAppointment(id)));
    }
}
