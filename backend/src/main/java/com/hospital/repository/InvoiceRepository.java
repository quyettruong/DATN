package com.hospital.repository;

import com.hospital.entity.Appointment;
import com.hospital.entity.Examination;
import com.hospital.entity.Invoice;
import com.hospital.entity.Patient;
import com.hospital.entity.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByPatientOrderByCreatedAtDesc(Patient patient);
    List<Invoice> findByStatus(InvoiceStatus status);
    List<Invoice> findAllByOrderByCreatedAtDesc();
    List<Invoice> findByStatusAndCreatedAtBetween(InvoiceStatus status, LocalDateTime from, LocalDateTime to);
    Optional<Invoice> findByAppointment(Appointment appointment);
    Optional<Invoice> findByExamination(Examination examination);
    Optional<Invoice> findTopByCreatedAtBetweenOrderByInvoiceNumberDesc(LocalDateTime start, LocalDateTime end);
}
