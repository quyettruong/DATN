package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.*;
import com.hospital.entity.enums.AppointmentStatus;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public AppointmentResponse createAppointment(String username, AppointmentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Patient patient = patientRepository.findByUser(user).orElse(null);
        if (patient == null) {
            String patientCode = String.format("BN%06d", user.getId());
            patient = Patient.builder()
                    .user(user)
                    .patientCode(patientCode)
                    .dob(LocalDate.of(1995, 1, 1))
                    .gender("MALE")
                    .address("TP. Hồ Chí Minh")
                    .build();
            patient = patientRepository.save(patient);
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        DoctorSchedule schedule = null;
        if (request.getScheduleId() != null) {
            schedule = scheduleRepository.findById(request.getScheduleId()).orElse(null);
        }

        // If schedule is null, or belongs to another doctor, or date doesn't match:
        if (schedule == null || !schedule.getDoctor().getId().equals(doctor.getId()) || !schedule.getDate().equals(request.getAppointmentDate())) {
            List<DoctorSchedule> docSchedules = scheduleRepository.findByDoctorAndDate(doctor, request.getAppointmentDate());
            if (!docSchedules.isEmpty()) {
                schedule = docSchedules.get(0);
            } else {
                Room room = roomRepository.findAll().stream()
                        .filter(r -> r.getDepartment() != null && doctor.getDepartment() != null && r.getDepartment().getId().equals(doctor.getDepartment().getId()))
                        .findFirst()
                        .orElseGet(() -> roomRepository.findAll().stream().findFirst().orElse(null));

                schedule = DoctorSchedule.builder()
                        .doctor(doctor)
                        .room(room)
                        .date(request.getAppointmentDate())
                        .startTime(java.time.LocalTime.of(7, 0))
                        .endTime(java.time.LocalTime.of(17, 30))
                        .maxSlots(30)
                        .bookedSlots(0)
                        .build();
                schedule = scheduleRepository.save(schedule);
            }
        }

        // Adjust schedule time bounds if requested time is outside
        if (request.getStartTime().isBefore(schedule.getStartTime())) {
            schedule.setStartTime(request.getStartTime());
            scheduleRepository.save(schedule);
        }
        if (!request.getStartTime().isBefore(schedule.getEndTime())) {
            schedule.setEndTime(request.getStartTime().plusMinutes(30));
            scheduleRepository.save(schedule);
        }

        if (schedule.getBookedSlots() >= schedule.getMaxSlots()) {
            schedule.setMaxSlots(schedule.getMaxSlots() + 10);
        }

        schedule.setBookedSlots(schedule.getBookedSlots() + 1);
        scheduleRepository.save(schedule);

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .schedule(schedule)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .reason(request.getReason() != null ? request.getReason() : "Khám sức khỏe")
                .status(AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);

        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getMyAppointments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Nếu là PATIENT thì trả appointments của patient đó
        // Nếu là STAFF/ADMIN thì trả tất cả appointments hôm nay
        if (user.getRole().name().equals("PATIENT")) {
            Patient patient = patientRepository.findByUser(user).orElse(null);
            if (patient == null) {
                return List.of();
            }
            return appointmentRepository.findByPatientOrderByAppointmentDateDesc(patient).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            // STAFF, ADMIN, DOCTOR, LAB_TECHNICIAN → trả appointments hôm nay
            return appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(LocalDate.now()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
    }

    public List<AppointmentResponse> getAppointmentsByDoctor(String username, LocalDate date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Not a doctor profile"));

        return appointmentRepository.findByDoctorAndAppointmentDate(doctor, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long id, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (username != null) {
            userRepository.findByUsername(username).ifPresent(caller -> {
                if (caller.getRole() == com.hospital.entity.enums.Role.PATIENT
                        && appointment.getPatient() != null
                        && appointment.getPatient().getUser() != null
                        && appointment.getPatient().getUser().getId() != null
                        && !appointment.getPatient().getUser().getId().equals(caller.getId())) {
                    throw new BadRequestException("Bạn không có quyền hủy lịch hẹn của người bệnh khác");
                }
            });
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Lịch hẹn này đã được hủy trước đó");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Không thể hủy lịch hẹn đã hoàn tất khám bệnh");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        
        DoctorSchedule schedule = appointment.getSchedule();
        if (schedule != null && schedule.getBookedSlots() > 0) {
            schedule.setBookedSlots(schedule.getBookedSlots() - 1);
            scheduleRepository.save(schedule);
        }

        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse getAppointmentById(Long id) {
        return getAppointmentById(id, null);
    }

    public AppointmentResponse getAppointmentById(Long id, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (username != null) {
            userRepository.findByUsername(username).ifPresent(caller -> {
                if (caller.getRole() == com.hospital.entity.enums.Role.PATIENT
                        && appointment.getPatient() != null
                        && appointment.getPatient().getUser() != null
                        && appointment.getPatient().getUser().getId() != null
                        && !appointment.getPatient().getUser().getId().equals(caller.getId())) {
                    throw new BadRequestException("Bạn không có quyền xem chi tiết lịch hẹn của người bệnh khác");
                }
            });
        }

        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAllAppointments(LocalDate date) {
        if (date != null) {
            return appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(date).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        String patientName = (appointment.getPatient() != null && appointment.getPatient().getUser() != null)
                ? appointment.getPatient().getUser().getFullName() : "Bệnh nhân";
        String doctorName = (appointment.getDoctor() != null && appointment.getDoctor().getUser() != null)
                ? appointment.getDoctor().getUser().getFullName() : "Bác sĩ phụ trách";
        String departmentName = (appointment.getDoctor() != null && appointment.getDoctor().getDepartment() != null)
                ? appointment.getDoctor().getDepartment().getName() : "Khoa Khám Bệnh";
        String roomName = (appointment.getSchedule() != null && appointment.getSchedule().getRoom() != null)
                ? appointment.getSchedule().getRoom().getName() : "Phòng khám";

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientName(patientName)
                .doctorName(doctorName)
                .departmentName(departmentName)
                .roomName(roomName)
                .appointmentDate(appointment.getAppointmentDate())
                .startTime(appointment.getStartTime())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
