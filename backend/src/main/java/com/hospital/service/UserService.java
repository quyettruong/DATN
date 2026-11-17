package com.hospital.service;

import com.hospital.dto.UserResponse;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.entity.enums.Role;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String fullName = body.get("fullName");
        String roleStr = body.get("role");

        if (username == null || username.trim().isEmpty()) {
            throw new BadRequestException("Tên đăng nhập không được để trống.");
        }
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new BadRequestException("Họ và tên không được để trống.");
        }

        username = username.trim().toLowerCase();
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Tên đăng nhập '" + username + "' đã tồn tại.");
        }

        if (password == null || password.trim().isEmpty()) {
            password = "Password@123";
        }

        Role role = Role.PATIENT;
        if (roleStr != null) {
            try {
                role = Role.valueOf(roleStr.trim().toUpperCase());
            } catch (Exception e) {
                role = Role.PATIENT;
            }
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .fullName(fullName.trim())
                .email(body.get("email") != null ? body.get("email").trim() : "")
                .phone(body.get("phone") != null ? body.get("phone").trim() : "")
                .role(role)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        if (role == Role.DOCTOR) {
            Department dept = null;
            if (body.get("departmentId") != null) {
                try {
                    dept = departmentRepository.findById(Long.parseLong(body.get("departmentId"))).orElse(null);
                } catch (Exception ignored) {}
            }
            if (dept == null) {
                dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            }

            Doctor doctor = Doctor.builder()
                    .user(user)
                    .department(dept)
                    .licenseNo(body.get("licenseNo") != null ? body.get("licenseNo").trim() : "CCHN-" + user.getId())
                    .specialization(body.get("specialization") != null ? body.get("specialization").trim() : (dept != null ? dept.getName() : "Đa khoa"))
                    .status("ACTIVE")
                    .build();
            doctorRepository.save(doctor);
        } else if (role == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .user(user)
                    .patientCode(String.format("BN%06d", user.getId()))
                    .gender(body.get("gender") != null ? body.get("gender") : "OTHER")
                    .address(body.get("address") != null ? body.get("address") : "")
                    .build();
            patientRepository.save(patient);
        }

        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + id));

        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            user.setFullName(updates.get("fullName").toString().trim());
        }
        if (updates.containsKey("email")) {
            user.setEmail(updates.get("email") != null ? updates.get("email").toString().trim() : "");
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone") != null ? updates.get("phone").toString().trim() : "");
        }
        if (updates.containsKey("role") && updates.get("role") != null) {
            try {
                user.setRole(Role.valueOf(updates.get("role").toString().trim().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (updates.containsKey("enabled") && updates.get("enabled") != null) {
            user.setEnabled(Boolean.parseBoolean(updates.get("enabled").toString()));
        }
        if (updates.containsKey("password") && updates.get("password") != null && !updates.get("password").toString().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updates.get("password").toString().trim()));
        }

        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        return toggleUserStatus(id, null);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id, String actorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + id));
        if (actorUsername != null && actorUsername.equalsIgnoreCase(user.getUsername()) && user.isEnabled()) {
            throw new BadRequestException("Không thể tự vô hiệu hóa tài khoản quản trị đang đăng nhập.");
        }
        user.setEnabled(!user.isEnabled());
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        deleteUser(id, null);
    }

    @Transactional
    public void deleteUser(Long id, String actorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + id));
        if (actorUsername != null && actorUsername.equalsIgnoreCase(user.getUsername())) {
            throw new BadRequestException("Không thể tự vô hiệu hóa tài khoản quản trị đang đăng nhập.");
        }
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateProfile(String username, Map<String, String> updates) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            user.setFullName(updates.get("fullName"));
        }
        if (updates.containsKey("email") && updates.get("email") != null) {
            user.setEmail(updates.get("email"));
        }
        if (updates.containsKey("phone") && updates.get("phone") != null) {
            user.setPhone(updates.get("phone"));
        }
        user = userRepository.save(user);

        if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUser(user).orElse(null);
            if (patient != null) {
                if (updates.containsKey("gender") && updates.get("gender") != null) {
                    patient.setGender(updates.get("gender"));
                }
                if (updates.containsKey("address") && updates.get("address") != null) {
                    patient.setAddress(updates.get("address"));
                }
                if (updates.containsKey("allergies")) {
                    patient.setAllergies(updates.get("allergies"));
                }
                if (updates.containsKey("medicalHistory")) {
                    patient.setMedicalHistory(updates.get("medicalHistory"));
                }
                if (updates.containsKey("bloodType")) {
                    patient.setBloodType(updates.get("bloodType"));
                }
                if (updates.containsKey("dob") && updates.get("dob") != null && !updates.get("dob").isEmpty()) {
                    try {
                        patient.setDob(java.time.LocalDate.parse(updates.get("dob")));
                    } catch (Exception ignored) {}
                }
                patientRepository.save(patient);
            }
        }
        return mapToResponse(user);
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        if (oldPassword == null || oldPassword.isBlank() || newPassword == null || newPassword.isBlank()) {
            throw new BadRequestException("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Mật khẩu cũ không chính xác.");
        }
        if (newPassword.length() < 6) {
            throw new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt());

        if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUser(user).orElse(null);
            if (patient != null) {
                builder.patientCode(patient.getPatientCode())
                        .dob(patient.getDob())
                        .gender(patient.getGender())
                        .address(patient.getAddress())
                        .allergies(patient.getAllergies())
                        .medicalHistory(patient.getMedicalHistory())
                        .bloodType(patient.getBloodType());
            }
        }

        return builder.build();
    }
}
