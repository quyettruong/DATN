package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExaminationService {

    private final ExaminationRepository examinationRepository;
    private final QueueTicketRepository queueTicketRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final LabOrderRepository labOrderRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final BillingService billingService;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public ExaminationResponse startExamination(Long ticketId, String doctorUsername) {
        QueueTicket ticket = queueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User user = userRepository.findByUsername(doctorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Examination exam = examinationRepository.findByQueueTicket(ticket)
                .orElseGet(() -> Examination.builder()
                        .queueTicket(ticket)
                        .doctor(doctor)
                        .patient(ticket.getCheckIn().getAppointment().getPatient())
                        .startedAt(LocalDateTime.now())
                        .build());

        // Auto-prefill Nurse Triage vitals & appointment reason if not yet recorded on Examination
        CheckIn ci = ticket.getCheckIn();
        if (ci != null) {
            if ((exam.getBloodPressure() == null || exam.getBloodPressure().isBlank())
                    && ci.getBloodPressureSystolic() != null && ci.getBloodPressureDiastolic() != null) {
                exam.setBloodPressure(ci.getBloodPressureSystolic() + "/" + ci.getBloodPressureDiastolic());
            }
            if (exam.getHeartRate() == null && ci.getHeartRate() != null) {
                exam.setHeartRate(ci.getHeartRate());
            }
            if (exam.getTemperature() == null && ci.getTemperature() != null) {
                exam.setTemperature(ci.getTemperature());
            }
            if (exam.getWeight() == null && ci.getWeight() != null) {
                exam.setWeight(ci.getWeight());
            }
            if (exam.getHeight() == null && ci.getHeight() != null) {
                exam.setHeight(ci.getHeight());
            }
            if ((exam.getSymptoms() == null || exam.getSymptoms().isBlank())
                    && ci.getAppointment() != null && ci.getAppointment().getReason() != null) {
                exam.setSymptoms(ci.getAppointment().getReason());
            }
        }
        
        exam = examinationRepository.save(exam);
        return mapToResponse(exam);
    }

    @Transactional
    public ExaminationResponse updateExamination(Long examId, ExaminationUpdateRequest request) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        
        exam.setSymptoms(request.getSymptoms());
        exam.setDiagnosis(request.getDiagnosis());
        exam.setNotes(request.getNotes());
        exam.setConclusion(request.getConclusion());
        exam.setBloodPressure(request.getBloodPressure());
        exam.setHeartRate(request.getHeartRate());
        exam.setTemperature(request.getTemperature());
        exam.setWeight(request.getWeight());
        exam.setHeight(request.getHeight());
        
        exam = examinationRepository.save(exam);
        return mapToResponse(exam);
    }

    @Transactional
    public ExaminationResponse completeExamination(Long examId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        exam.setEndedAt(LocalDateTime.now());
        exam = examinationRepository.save(exam);

        // 1. Complete Queue Ticket if linked
        if (exam.getQueueTicket() != null) {
            QueueTicket ticket = exam.getQueueTicket();
            ticket.setStatus(com.hospital.entity.enums.QueueStatus.COMPLETED);
            ticket.setCompletedAt(LocalDateTime.now());
            queueTicketRepository.save(ticket);

            // 2. Complete Appointment if linked
            if (ticket.getCheckIn() != null && ticket.getCheckIn().getAppointment() != null) {
                Appointment appointment = ticket.getCheckIn().getAppointment();
                appointment.setStatus(com.hospital.entity.enums.AppointmentStatus.COMPLETED);
                appointmentRepository.save(appointment);
            }
        }

        // 3. Auto-generate & synchronize full Invoice (Consultation + Labs + Medications)
        billingService.syncExaminationInvoice(exam);

        return mapToResponse(exam);
    }

    public ExaminationResponse getExamination(Long examId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        return mapToResponse(exam);
    }
    
    public ExaminationResponse getExaminationByTicket(Long ticketId) {
        QueueTicket ticket = queueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        Examination exam = examinationRepository.findByQueueTicket(ticket)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        return mapToResponse(exam);
    }

    public List<ExaminationResponse> getPatientHistory(Long patientId) {
        return examinationRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ExaminationResponse> getMyHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = patientRepository.findByUser(user).orElse(null);
        if (patient == null) {
            return List.of();
        }
        return getPatientHistory(patient.getId());
    }

    private ExaminationResponse mapToResponse(Examination exam) {
        Long patientId = (exam.getPatient() != null) ? exam.getPatient().getId() : null;
        String patientName = (exam.getPatient() != null && exam.getPatient().getUser() != null)
                ? exam.getPatient().getUser().getFullName() : "Bệnh nhân";
        String patientCode = (exam.getPatient() != null) ? exam.getPatient().getPatientCode() : "";
        String patientGender = (exam.getPatient() != null) ? exam.getPatient().getGender() : null;
        java.time.LocalDate patientDob = (exam.getPatient() != null) ? exam.getPatient().getDob() : null;
        String patientAllergies = (exam.getPatient() != null) ? exam.getPatient().getAllergies() : null;
        String patientMedicalHistory = (exam.getPatient() != null) ? exam.getPatient().getMedicalHistory() : null;
        String patientBloodType = (exam.getPatient() != null) ? exam.getPatient().getBloodType() : null;
        String doctorName = (exam.getDoctor() != null && exam.getDoctor().getUser() != null)
                ? exam.getDoctor().getUser().getFullName() : "Bác sĩ phụ trách";

        Long doctorId = (exam.getDoctor() != null) ? exam.getDoctor().getId() : null;
        Long queueTicketId = (exam.getQueueTicket() != null) ? exam.getQueueTicket().getId() : null;
        CheckIn ci = (exam.getQueueTicket() != null) ? exam.getQueueTicket().getCheckIn() : null;
        Long appointmentId = (ci != null && ci.getAppointment() != null) ? ci.getAppointment().getId() : null;
        Integer spO2 = (ci != null) ? ci.getSpO2() : null;
        String triageLevel = (ci != null && ci.getTriageLevel() != null) ? ci.getTriageLevel().name()
                : (exam.getQueueTicket() != null && exam.getQueueTicket().getTriageLevel() != null
                ? exam.getQueueTicket().getTriageLevel().name() : null);

        return ExaminationResponse.builder()
                .id(exam.getId())
                .patientId(patientId)
                .patientName(patientName)
                .patientCode(patientCode)
                .patientGender(patientGender)
                .patientDob(patientDob)
                .patientAllergies(patientAllergies)
                .patientMedicalHistory(patientMedicalHistory)
                .patientBloodType(patientBloodType)
                .doctorName(doctorName)
                .queueTicketId(queueTicketId)
                .appointmentId(appointmentId)
                .symptoms(exam.getSymptoms())
                .diagnosis(exam.getDiagnosis())
                .notes(exam.getNotes())
                .conclusion(exam.getConclusion())
                .bloodPressure(exam.getBloodPressure())
                .heartRate(exam.getHeartRate())
                .temperature(exam.getTemperature())
                .weight(exam.getWeight())
                .height(exam.getHeight())
                .spO2(spO2)
                .triageLevel(triageLevel)
                .vitals(String.format("BP: %s, HR: %s, Temp: %s, Wt: %s, Ht: %s", 
                        exam.getBloodPressure() != null ? exam.getBloodPressure() : "-",
                        exam.getHeartRate() != null ? exam.getHeartRate() : "-",
                        exam.getTemperature() != null ? exam.getTemperature() : "-",
                        exam.getWeight() != null ? exam.getWeight() : "-",
                        exam.getHeight() != null ? exam.getHeight() : "-"))
                .startedAt(exam.getStartedAt())
                .endedAt(exam.getEndedAt())
                .build();
    }
}
