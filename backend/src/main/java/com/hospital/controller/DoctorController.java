package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.DoctorResponse;
import com.hospital.dto.ScheduleResponse;
import com.hospital.entity.Doctor;
import com.hospital.entity.DoctorSchedule;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DoctorScheduleRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor APIs")
@SecurityRequirement(name = "bearerAuth")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final com.hospital.repository.RoomRepository roomRepository;
    private final com.hospital.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors(
            @RequestParam(required = false) Long departmentId) {
        List<DoctorResponse> doctors = doctorRepository.findAll().stream()
                .filter(doctor -> departmentId == null || (doctor.getDepartment() != null && doctor.getDepartment().getId().equals(departmentId)))
                .map(doctor -> DoctorResponse.builder()
                .id(doctor.getId())
                .departmentId(doctor.getDepartment() != null ? doctor.getDepartment().getId() : null)
                .fullName(doctor.getUser() != null ? doctor.getUser().getFullName() : "Bác sĩ")
                .specialization(doctor.getSpecialization())
                .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                .licenseNo(doctor.getLicenseNo())
                .status(doctor.getStatus())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctor(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        DoctorResponse response = DoctorResponse.builder()
                .id(doctor.getId())
                .departmentId(doctor.getDepartment() != null ? doctor.getDepartment().getId() : null)
                .fullName(doctor.getUser() != null ? doctor.getUser().getFullName() : "Bác sĩ")
                .specialization(doctor.getSpecialization())
                .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                .licenseNo(doctor.getLicenseNo())
                .status(doctor.getStatus())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/schedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getDoctorSchedules(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        List<DoctorSchedule> rawList = scheduleRepository.findByDoctorAndDate(doctor, date);

        if (rawList.isEmpty() && !date.isBefore(LocalDate.now()) && !date.isAfter(LocalDate.now().plusDays(60))) {
            com.hospital.entity.Room room = roomRepository.findAll().stream()
                    .filter(r -> r.getDepartment() != null && doctor.getDepartment() != null && r.getDepartment().getId().equals(doctor.getDepartment().getId()))
                    .findFirst()
                    .orElseGet(() -> roomRepository.findAll().stream().findFirst().orElse(null));
            DoctorSchedule autoSchedule = DoctorSchedule.builder()
                    .doctor(doctor)
                    .room(room)
                    .date(date)
                    .startTime(java.time.LocalTime.of(7, 0))
                    .endTime(java.time.LocalTime.of(17, 30))
                    .maxSlots(30)
                    .bookedSlots(0)
                    .build();
            autoSchedule = scheduleRepository.save(autoSchedule);
            rawList = List.of(autoSchedule);
        }

        List<ScheduleResponse> schedules = rawList.stream()
                .map(schedule -> ScheduleResponse.builder()
                        .id(schedule.getId())
                        .doctorId(doctor.getId())
                        .doctorName(doctor.getUser() != null ? doctor.getUser().getFullName() : "Bác sĩ")
                        .roomId(schedule.getRoom() != null ? schedule.getRoom().getId() : null)
                        .roomName(schedule.getRoom() != null ? schedule.getRoom().getName() : "Phòng khám chung")
                        .date(schedule.getDate())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .maxSlots(schedule.getMaxSlots())
                        .bookedSlots(schedule.getBookedSlots())
                        .availableSlots(schedule.getMaxSlots() - schedule.getBookedSlots())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(schedules));
    }

    @GetMapping("/my-schedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getMySchedules(
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        com.hospital.entity.User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + user.getUsername()));

        List<DoctorSchedule> rawList = scheduleRepository.findByDoctorOrderByDateAscStartTimeAsc(doctor);

        if (rawList.isEmpty()) {
            LocalDate today = LocalDate.now();
            com.hospital.entity.Room room = roomRepository.findAll().stream()
                    .filter(r -> r.getDepartment() != null && doctor.getDepartment() != null && r.getDepartment().getId().equals(doctor.getDepartment().getId()))
                    .findFirst()
                    .orElseGet(() -> roomRepository.findAll().stream().findFirst().orElse(null));
            for (int i = 0; i < 7; i++) {
                LocalDate d = today.plusDays(i);
                DoctorSchedule autoSchedule = DoctorSchedule.builder()
                        .doctor(doctor)
                        .room(room)
                        .date(d)
                        .startTime(java.time.LocalTime.of(8, 0))
                        .endTime(java.time.LocalTime.of(17, 0))
                        .maxSlots(25)
                        .bookedSlots(0)
                        .build();
                scheduleRepository.save(autoSchedule);
            }
            rawList = scheduleRepository.findByDoctorOrderByDateAscStartTimeAsc(doctor);
        }

        List<ScheduleResponse> schedules = rawList.stream()
                .map(schedule -> ScheduleResponse.builder()
                        .id(schedule.getId())
                        .doctorId(doctor.getId())
                        .doctorName(doctor.getUser() != null ? doctor.getUser().getFullName() : "Bác sĩ")
                        .roomId(schedule.getRoom() != null ? schedule.getRoom().getId() : null)
                        .roomName(schedule.getRoom() != null ? schedule.getRoom().getName() : "Phòng khám chung")
                        .date(schedule.getDate())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .maxSlots(schedule.getMaxSlots())
                        .bookedSlots(schedule.getBookedSlots())
                        .availableSlots(schedule.getMaxSlots() - schedule.getBookedSlots())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(schedules));
    }
}
