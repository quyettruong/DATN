package com.hospital.repository;

import com.hospital.entity.Doctor;
import com.hospital.entity.DoctorSchedule;
import com.hospital.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctorAndDate(Doctor doctor, LocalDate date);
    List<DoctorSchedule> findByDateAndRoom(LocalDate date, Room room);
    List<DoctorSchedule> findByDoctor(Doctor doctor);
    List<DoctorSchedule> findByDoctorOrderByDateAscStartTimeAsc(Doctor doctor);
}
