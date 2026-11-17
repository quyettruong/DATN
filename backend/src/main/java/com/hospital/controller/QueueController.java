package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.QueueTicketResponse;
import com.hospital.dto.WalkInCheckInRequest;
import com.hospital.service.QueueService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/queues")
@RequiredArgsConstructor
@Tag(name = "Queues", description = "Queue Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class QueueController {

    private final QueueService queueService;

    @PostMapping("/check-in/{appointmentId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<QueueTicketResponse>> checkIn(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(queueService.checkInAndCreateTicket(appointmentId, authentication.getName())));
    }

    @PostMapping("/walk-in")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<QueueTicketResponse>> checkInWalkIn(
            @RequestBody WalkInCheckInRequest request) {
        return ResponseEntity.ok(ApiResponse.success(queueService.checkInWalkIn(request)));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<QueueTicketResponse>>> getQueueByRoom(
            @PathVariable Long roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        if (date == null) date = LocalDate.now();
        List<QueueTicketResponse> list = queueService.getQueueByRoom(roomId, date);
        if (!isClinicalUser(authentication)) {
            list.forEach(t -> t.setReason(null));
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponse<List<QueueTicketResponse>>> lookupTicket(
            @RequestParam String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        if (date == null) date = LocalDate.now();
        List<QueueTicketResponse> list = queueService.lookupTicket(q, date);
        if (!isClinicalUser(authentication)) {
            list.forEach(t -> t.setReason(null));
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    private boolean isClinicalUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream().anyMatch(a -> {
            String role = a.getAuthority();
            return "ROLE_STAFF".equals(role)
                    || "ROLE_DOCTOR".equals(role)
                    || "ROLE_ADMIN".equals(role)
                    || "ROLE_LAB_TECHNICIAN".equals(role);
        });
    }

    @GetMapping("/my-queue")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<QueueTicketResponse>>> getMyQueue(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(queueService.getQueueByDoctor(authentication.getName(), date)));
    }

    @GetMapping("/my-ticket")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<QueueTicketResponse>>> getMyTicket(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(queueService.getMyQueueTicket(authentication.getName(), date)));
    }

    @PostMapping("/call-next")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueTicketResponse>> callNext(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(queueService.callNext(authentication.getName())));
    }

    @PostMapping("/{ticketId}/start-exam")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueTicketResponse>> startExam(
            @PathVariable Long ticketId, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(queueService.startExam(ticketId, authentication.getName())));
    }

    @PostMapping("/{ticketId}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueTicketResponse>> completeExam(
            @PathVariable Long ticketId, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(queueService.completeExam(ticketId, authentication.getName())));
    }

    @PostMapping("/{ticketId}/skip")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueTicketResponse>> skipTicket(
            @PathVariable Long ticketId, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(queueService.skipTicket(ticketId, authentication.getName())));
    }
}
