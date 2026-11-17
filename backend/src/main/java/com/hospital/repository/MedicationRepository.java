package com.hospital.repository;

import com.hospital.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByActiveTrue();
    List<Medication> findByNameContainingIgnoreCase(String name);
    java.util.Optional<Medication> findByCode(String code);
}
