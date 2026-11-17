package com.hospital.repository;

import com.hospital.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByCategory(String category);
    List<LabTest> findByActiveTrue();
    java.util.Optional<LabTest> findByCode(String code);
}
