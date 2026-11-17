package com.hospital.repository;

import com.hospital.entity.Patient;
import com.hospital.entity.FollowUpAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpAppointmentRepository extends JpaRepository<FollowUpAppointment, Long> {
    List<FollowUpAppointment> findByPatient(Patient patient);
    List<FollowUpAppointment> findByPatientUserUsername(String username);
}
