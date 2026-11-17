package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.DepartmentResponse;
import com.hospital.dto.DoctorResponse;
import com.hospital.entity.Department;
import com.hospital.entity.Room;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.RoomRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department APIs")
@SecurityRequirement(name = "bearerAuth")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final DoctorRepository doctorRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllDepartments() {
        List<DepartmentResponse> departments = departmentRepository.findAll().stream().map(dept -> {
            int roomCount = roomRepository.findByDepartment(dept).size();
            return DepartmentResponse.builder()
                    .id(dept.getId())
                    .code(dept.getCode())
                    .name(dept.getName())
                    .description(dept.getDescription())
                    .roomCount(roomCount)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentById(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        int roomCount = roomRepository.findByDepartment(dept).size();
        DepartmentResponse response = DepartmentResponse.builder()
                .id(dept.getId())
                .code(dept.getCode())
                .name(dept.getName())
                .description(dept.getDescription())
                .roomCount(roomCount)
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsInDepartment(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        List<DoctorResponse> doctors = doctorRepository.findByDepartment(dept).stream().map(doc -> DoctorResponse.builder()
                .id(doc.getId())
                .fullName(doc.getUser().getFullName())
                .specialization(doc.getSpecialization())
                .departmentName(dept.getName())
                .licenseNo(doc.getLicenseNo())
                .status(doc.getUser().isEnabled() ? "ACTIVE" : "INACTIVE")
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<ApiResponse<List<Room>>> getRoomsInDepartment(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        List<Room> rooms = roomRepository.findByDepartment(dept);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    @org.springframework.web.bind.annotation.PostMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Create department (Admin)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body) {
        String code = body.get("code");
        String name = body.get("name");
        String description = body.get("description");

        if (code == null || code.trim().isEmpty() || name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã khoa và tên khoa không được để trống."));
        }

        code = code.trim().toUpperCase();
        if (departmentRepository.findByCode(code).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã khoa '" + code + "' đã tồn tại trong hệ thống."));
        }

        Department dept = Department.builder()
                .code(code)
                .name(name.trim())
                .description(description != null ? description.trim() : "")
                .build();
        dept = departmentRepository.save(dept);

        DepartmentResponse response = DepartmentResponse.builder()
                .id(dept.getId())
                .code(dept.getCode())
                .name(dept.getName())
                .description(dept.getDescription())
                .roomCount(0)
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Update department (Admin)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên khoa ID: " + id));

        if (body.containsKey("name") && body.get("name") != null && !body.get("name").trim().isEmpty()) {
            dept.setName(body.get("name").trim());
        }
        if (body.containsKey("description")) {
            dept.setDescription(body.get("description") != null ? body.get("description").trim() : "");
        }
        if (body.containsKey("code") && body.get("code") != null && !body.get("code").trim().isEmpty()) {
            String newCode = body.get("code").trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(dept.getCode()) && departmentRepository.findByCode(newCode).isPresent()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Mã khoa '" + newCode + "' đã tồn tại."));
            }
            dept.setCode(newCode);
        }

        dept = departmentRepository.save(dept);
        int roomCount = roomRepository.findByDepartment(dept).size();

        DepartmentResponse response = DepartmentResponse.builder()
                .id(dept.getId())
                .code(dept.getCode())
                .name(dept.getName())
                .description(dept.getDescription())
                .roomCount(roomCount)
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Delete department (Admin)")
    public ResponseEntity<ApiResponse<String>> deleteDepartment(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên khoa ID: " + id));

        if (!doctorRepository.findByDepartment(dept).isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không thể xóa chuyên khoa đang có bác sĩ công tác. Vui lòng chuyển bác sĩ sang khoa khác trước."));
        }
        if (!roomRepository.findByDepartment(dept).isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không thể xóa chuyên khoa đang có phòng khám trực thuộc."));
        }

        departmentRepository.delete(dept);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa chuyên khoa thành công."));
    }
}
