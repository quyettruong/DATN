package com.hospital.service;

import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.*;
import com.hospital.entity.enums.AppointmentStatus;
import com.hospital.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorScheduleRepository scheduleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private Appointment appointment;
    private DoctorSchedule schedule;

    @BeforeEach
    void setUp() {
        User patientUser = User.builder().fullName("Lê Văn Cường").build();
        Patient patient = Patient.builder().id(1L).patientCode("BN000001").user(patientUser).build();

        User doctorUser = User.builder().fullName("BS. Trần Bình").build();
        Doctor doctor = Doctor.builder().id(2L).user(doctorUser).build();

        schedule = DoctorSchedule.builder()
                .id(10L)
                .doctor(doctor)
                .date(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(12, 0))
                .maxSlots(20)
                .bookedSlots(5)
                .build();

        appointment = Appointment.builder()
                .id(100L)
                .patient(patient)
                .doctor(doctor)
                .schedule(schedule)
                .appointmentDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 30))
                .status(AppointmentStatus.PENDING)
                .reason("Khám tổng quát")
                .build();
    }

    @Test
    @DisplayName("1. Xác nhận lịch hẹn: Chuyển trạng thái từ PENDING sang CONFIRMED")
    void testConfirmAppointment_Success() {
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        AppointmentResponse response = appointmentService.confirmAppointment(100L);

        assertThat(response.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    @Test
    @DisplayName("2. Hủy lịch hẹn: Chuyển trạng thái CANCELLED và hoàn lại slot đặt khám")
    void testCancelAppointment_DecrementsBookedSlot() {
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        AppointmentResponse response = appointmentService.cancelAppointment(100L, "patient1");

        assertThat(response.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
        assertThat(schedule.getBookedSlots()).isEqualTo(4); // 5 - 1 = 4
        verify(scheduleRepository).save(schedule);
    }

    @Test
    @DisplayName("3. Lấy thông tin lịch hẹn theo ID thành công")
    void testGetAppointmentById_Success() {
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        AppointmentResponse response = appointmentService.getAppointmentById(100L);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getPatientName()).isEqualTo("Lê Văn Cường");
        assertThat(response.getDoctorName()).isEqualTo("BS. Trần Bình");
    }

    @Test
    @DisplayName("4. Bảo mật hủy lịch hẹn: Chặn bệnh nhân hủy lịch hẹn của người bệnh khác")
    void testCancelAppointment_BlocksUnauthorizedPatient() {
        appointment.getPatient().getUser().setId(10L);
        User anotherPatient = User.builder()
                .id(99L)
                .username("patient_other")
                .role(com.hospital.entity.enums.Role.PATIENT)
                .build();

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(userRepository.findByUsername("patient_other")).thenReturn(Optional.of(anotherPatient));

        assertThatThrownBy(() -> appointmentService.cancelAppointment(100L, "patient_other"))
                .isInstanceOf(com.hospital.exception.BadRequestException.class)
                .hasMessageContaining("không có quyền hủy");
    }

    @Test
    @DisplayName("5. Chặn hủy lặp lại lịch hẹn đã CANCELLED để không bị trừ âm slot bác sĩ")
    void testCancelAppointment_PreventsDoubleCancelSlotUnderflow() {
        appointment.setStatus(AppointmentStatus.CANCELLED);
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.cancelAppointment(100L, "staff1"))
                .isInstanceOf(com.hospital.exception.BadRequestException.class)
                .hasMessageContaining("đã được hủy");

        assertThat(schedule.getBookedSlots()).isEqualTo(5);
    }
}
