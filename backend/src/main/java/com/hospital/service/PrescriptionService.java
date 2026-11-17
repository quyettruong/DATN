package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.entity.enums.Role;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final ExaminationRepository examinationRepository;
    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BillingService billingService;

    @Transactional
    public PrescriptionResponse createPrescription(Long examId, PrescriptionRequest request) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));

        // Reuse existing ACTIVE (un-dispensed) prescription on this examination if present
        Optional<Prescription> existingActive = prescriptionRepository.findByExamination(exam).stream()
                .filter(p -> !"DISPENSED".equalsIgnoreCase(p.getStatus()) && !"CANCELLED".equalsIgnoreCase(p.getStatus()))
                .findFirst();

        Prescription prescription;
        if (existingActive.isPresent()) {
            prescription = existingActive.get();
            prescription.setDiagnosis(request.getDiagnosis() != null ? request.getDiagnosis() : exam.getDiagnosis());
            prescription.setNotes(request.getNotes());
            prescription.setPrescribedAt(LocalDateTime.now());
            prescription.setStatus("ACTIVE");
            prescription = prescriptionRepository.save(prescription);

            List<PrescriptionItem> oldItems = prescriptionItemRepository.findByPrescription(prescription);
            if (!oldItems.isEmpty()) {
                prescriptionItemRepository.deleteAll(oldItems);
            }
        } else {
            prescription = Prescription.builder()
                    .examination(exam)
                    .doctor(exam.getDoctor())
                    .patient(exam.getPatient())
                    .diagnosis(request.getDiagnosis() != null ? request.getDiagnosis() : exam.getDiagnosis())
                    .notes(request.getNotes())
                    .status("ACTIVE")
                    .prescribedAt(LocalDateTime.now())
                    .build();
            prescription = prescriptionRepository.save(prescription);
        }

        List<PrescriptionItem> items = new ArrayList<>();
        if (request.getItems() != null) {
            for (PrescriptionItemRequest itemReq : request.getItems()) {
                Medication med = medicationRepository.findById(itemReq.getMedicationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medication not found"));
                int qty = Math.max(1, itemReq.getQuantity());
                PrescriptionItem item = PrescriptionItem.builder()
                        .prescription(prescription)
                        .medication(med)
                        .dosage(itemReq.getDosage())
                        .frequency(itemReq.getFrequency())
                        .duration(itemReq.getDuration())
                        .quantity(qty)
                        .instruction(itemReq.getInstruction())
                        .build();
                items.add(prescriptionItemRepository.save(item));
            }
        }

        // Auto-sync medication charges onto patient's Invoice
        billingService.syncExaminationInvoice(exam);

        return mapToResponse(prescription, items);
    }

    public List<PrescriptionResponse> getPrescriptionsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUser(user).orElse(null);
            if (doctor == null) {
                return List.of();
            }
            return prescriptionRepository.findByDoctorOrderByCreatedAtDesc(doctor).stream()
                    .map(p -> mapToResponse(p, prescriptionItemRepository.findByPrescription(p)))
                    .collect(Collectors.toList());
        }
        return prescriptionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> mapToResponse(p, prescriptionItemRepository.findByPrescription(p)))
                .collect(Collectors.toList());
    }

    public List<PrescriptionResponse> getPrescriptionsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return prescriptionRepository.findByPatientOrderByCreatedAtDesc(patient).stream()
                .map(p -> mapToResponse(p, prescriptionItemRepository.findByPrescription(p)))
                .collect(Collectors.toList());
    }

    public List<PrescriptionResponse> getMyPrescriptions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = patientRepository.findByUser(user).orElse(null);
        if (patient == null) {
            return List.of();
        }
        return prescriptionRepository.findByPatientOrderByCreatedAtDesc(patient).stream()
                .map(p -> mapToResponse(p, prescriptionItemRepository.findByPrescription(p)))
                .collect(Collectors.toList());
    }

    public List<PrescriptionResponse> getPrescriptionsByExamination(Long examId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        return prescriptionRepository.findByExamination(exam).stream()
                .map(p -> mapToResponse(p, prescriptionItemRepository.findByPrescription(p)))
                .collect(Collectors.toList());
    }

    public PrescriptionResponse getPrescription(Long id) {
        return getPrescription(id, null);
    }

    public PrescriptionResponse getPrescription(Long id, String username) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (username != null) {
            userRepository.findByUsername(username).ifPresent(caller -> {
                if (caller.getRole() == Role.PATIENT
                        && p.getPatient() != null
                        && p.getPatient().getUser() != null
                        && p.getPatient().getUser().getId() != null
                        && !p.getPatient().getUser().getId().equals(caller.getId())) {
                    throw new BadRequestException("Bạn không có quyền xem đơn thuốc của người bệnh khác");
                }
            });
        }

        return mapToResponse(p, prescriptionItemRepository.findByPrescription(p));
    }

    private PrescriptionResponse mapToResponse(Prescription prescription, List<PrescriptionItem> items) {
        List<PrescriptionItemResponse> itemResponses = items.stream().map(i -> PrescriptionItemResponse.builder()
                .id(i.getId())
                .medicationId(i.getMedication() != null ? i.getMedication().getId() : null)
                .medicationName(i.getMedication() != null ? i.getMedication().getName() : "Dược phẩm")
                .dosageForm(i.getMedication() != null ? i.getMedication().getDosageForm() : null)
                .dosage(i.getDosage())
                .frequency(i.getFrequency())
                .duration(i.getDuration())
                .quantity(i.getQuantity())
                .instruction(i.getInstruction())
                .build()).collect(Collectors.toList());

        Patient patient = prescription.getPatient();
        Doctor doctor = prescription.getDoctor();

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .examinationId(prescription.getExamination() != null ? prescription.getExamination().getId() : null)
                .doctorName(doctor != null && doctor.getUser() != null ? doctor.getUser().getFullName() : "Bác sĩ điều trị")
                .patientId(patient != null ? patient.getId() : null)
                .patientName(patient != null && patient.getUser() != null ? patient.getUser().getFullName() : "Bệnh nhân")
                .patientCode(patient != null ? patient.getPatientCode() : null)
                .patientAllergies(patient != null ? patient.getAllergies() : null)
                .patientBloodType(patient != null ? patient.getBloodType() : null)
                .diagnosis(prescription.getDiagnosis())
                .notes(prescription.getNotes())
                .status(prescription.getStatus() != null ? prescription.getStatus() : "ACTIVE")
                .items(itemResponses)
                .prescribedAt(prescription.getPrescribedAt())
                .createdAt(prescription.getCreatedAt() != null ? prescription.getCreatedAt() : prescription.getPrescribedAt())
                .build();
    }
}
