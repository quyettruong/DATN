package com.hospital.service;

import com.hospital.dto.LoginRequest;
import com.hospital.dto.LoginResponse;
import com.hospital.dto.RegisterRequest;
import com.hospital.dto.UserResponse;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.entity.enums.Role;
import com.hospital.exception.BadRequestException;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtTokenProvider;
import com.hospital.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;

    public LoginResponse login(LoginRequest request) {
        String rawUsername = request.getUsername() != null ? request.getUsername().trim() : "";
        if (loginAttemptService.isBlocked(rawUsername)) {
            throw new BadRequestException("Tài khoản tạm thời bị khóa 5 phút do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(rawUsername, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            loginAttemptService.loginFailed(rawUsername);
            throw ex;
        }

        loginAttemptService.loginSucceeded(rawUsername);

        User user = userRepository.findByUsername(rawUsername)
                .orElseThrow(() -> new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác"));

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.PATIENT)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        String patientCode = String.format("BN%06d", user.getId());

        Patient patient = Patient.builder()
                .user(user)
                .patientCode(patientCode)
                .dob(request.getDob())
                .gender(request.getGender())
                .address(request.getAddress())
                .build();

        patientRepository.save(patient);

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
