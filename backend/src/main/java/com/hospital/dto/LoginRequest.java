package com.hospital.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login Request")
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Schema(description = "User's username", example = "admin")
    private String username;

    @NotBlank(message = "Password is required")
    @Schema(description = "User's password", example = "123456")
    private String password;
}
