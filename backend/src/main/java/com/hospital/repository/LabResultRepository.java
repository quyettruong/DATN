package com.hospital.repository;

import com.hospital.entity.LabOrder;
import com.hospital.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    Optional<LabResult> findByLabOrder(LabOrder labOrder);
}
