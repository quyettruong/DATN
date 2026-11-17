package com.hospital.repository;

import com.hospital.entity.Department;
import com.hospital.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByDepartment(Department department);
    Optional<Room> findByCode(String code);
}
