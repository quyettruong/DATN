package com.hospital.repository;

import com.hospital.entity.Doctor;
import com.hospital.entity.Examination;
import com.hospital.entity.Patient;
import com.hospital.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByExamination(Examination examination);
    List<Prescription> findByPatientOrderByCreatedAtDesc(Patient patient);
    List<Prescription> findByDoctorOrderByCreatedAtDesc(Doctor doctor);
    List<Prescription> findByStatusOrderByCreatedAtDesc(String status);
    List<Prescription> findAllByOrderByCreatedAtDesc();
}
