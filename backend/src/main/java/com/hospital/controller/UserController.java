package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.UserResponse;
import com.hospital.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(userService.getCurrentUser(authentication.getName())));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(authentication.getName(), updates)));
    }

    @RequestMapping(value = {"/me/change-password", "/me/password"}, method = {RequestMethod.POST, RequestMethod.PUT})
    @Operation(summary = "Change current user password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        userService.changePassword(
                authentication.getName(),
                body.get("oldPassword"),
                body.get("newPassword")
        );
        return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã được thay đổi thành công."));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(userService.createUser(body)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUser(id, body)));
    }

    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle user active status (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.toggleUserStatus(id, authentication != null ? authentication.getName() : null)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate user (Admin only)")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {
        userService.deleteUser(id, authentication != null ? authentication.getName() : null);
        return ResponseEntity.ok(ApiResponse.success("Đã vô hiệu hóa tài khoản thành công."));
    }
}
