package com.hospital.service;

import com.hospital.dto.FollowUpRequest;
import com.hospital.dto.FollowUpResponse;
import com.hospital.entity.Examination;
import com.hospital.entity.FollowUpAppointment;
import com.hospital.entity.Patient;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.ExaminationRepository;
import com.hospital.repository.FollowUpAppointmentRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowUpService {

    private final FollowUpAppointmentRepository followUpAppointmentRepository;
    private final ExaminationRepository examinationRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public FollowUpResponse createFollowUp(Long examId, FollowUpRequest request) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));

        FollowUpAppointment followUp = FollowUpAppointment.builder()
                .examination(exam)
                .patient(exam.getPatient())
                .doctor(exam.getDoctor())
                .scheduledDate(request.getScheduledDate())
                .notes(request.getNotes())
                .status("SCHEDULED")
                .build();
        
        followUp = followUpAppointmentRepository.save(followUp);
        return mapToResponse(followUp);
    }

    public List<FollowUpResponse> getFollowUpsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return followUpAppointmentRepository.findByPatient(patient).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FollowUpResponse> getMyFollowUps(String username) {
        return followUpAppointmentRepository.findByPatientUserUsername(username).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FollowUpResponse mapToResponse(FollowUpAppointment followUp) {
        String patientName = (followUp.getPatient() != null && followUp.getPatient().getUser() != null)
                ? followUp.getPatient().getUser().getFullName() : "Bệnh nhân";
        String doctorName = (followUp.getDoctor() != null && followUp.getDoctor().getUser() != null)
                ? followUp.getDoctor().getUser().getFullName() : "Bác sĩ";

        return FollowUpResponse.builder()
                .id(followUp.getId())
                .patientName(patientName)
                .doctorName(doctorName)
                .scheduledDate(followUp.getScheduledDate())
                .notes(followUp.getNotes())
                .status(followUp.getStatus())
                .build();
    }
}