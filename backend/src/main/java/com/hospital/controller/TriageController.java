package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.CheckInResponse;
import com.hospital.dto.TriageRequest;
import com.hospital.entity.enums.TriageLevel;
import com.hospital.service.TriageService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/triage")
@RequiredArgsConstructor
@Tag(name = "Triage", description = "Triage management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TriageController {

    private final TriageService triageService;

    @PostMapping("/check-ins/{checkInId}/triage")
    public ResponseEntity<ApiResponse<CheckInResponse>> recordTriage(
            @PathVariable Long checkInId,
            @RequestBody TriageRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(triageService.recordTriage(checkInId, request, authentication.getName())));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<java.util.List<CheckInResponse>>> getPendingCheckIns() {
        return ResponseEntity.ok(ApiResponse.success(triageService.getPendingTriageCheckIns()));
    }

    @PostMapping("/suggest")
    public ResponseEntity<ApiResponse<TriageLevel>> suggestTriageLevel(@RequestBody TriageRequest request) {
        return ResponseEntity.ok(ApiResponse.success(triageService.suggestTriageLevel(request)));
    }
}
