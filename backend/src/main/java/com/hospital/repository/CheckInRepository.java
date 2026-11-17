package com.hospital.repository;

import com.hospital.entity.Appointment;
import com.hospital.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    Optional<CheckIn> findByAppointment(Appointment appointment);
    List<CheckIn> findByTriageLevelIsNullOrderByCheckedInAtAsc();
}
