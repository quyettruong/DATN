package com.hospital.repository;

import com.hospital.entity.Doctor;
import com.hospital.entity.Examination;
import com.hospital.entity.QueueTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Long> {
    Optional<Examination> findByQueueTicket(QueueTicket queueTicket);
    List<Examination> findByDoctor(Doctor doctor);
    List<Examination> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
