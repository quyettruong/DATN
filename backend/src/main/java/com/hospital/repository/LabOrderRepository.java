package com.hospital.repository;

import com.hospital.entity.Examination;
import com.hospital.entity.LabOrder;
import com.hospital.entity.enums.LabOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
    List<LabOrder> findByExamination(Examination examination);
    List<LabOrder> findByStatus(LabOrderStatus status);
    List<LabOrder> findByExaminationDoctorUserUsernameAndStatus(String username, LabOrderStatus status);
    List<LabOrder> findByExaminationPatientUserUsernameOrderByOrderedAtDesc(String username);
}
