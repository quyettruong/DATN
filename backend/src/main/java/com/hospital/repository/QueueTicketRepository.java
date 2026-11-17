package com.hospital.repository;

import com.hospital.entity.CheckIn;
import com.hospital.entity.Doctor;
import com.hospital.entity.QueueTicket;
import com.hospital.entity.Room;
import com.hospital.entity.enums.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface QueueTicketRepository extends JpaRepository<QueueTicket, Long> {
    List<QueueTicket> findByQueueDateAndRoomOrderByCreatedAtAsc(LocalDate queueDate, Room room);
    List<QueueTicket> findByQueueDateAndDoctorAndStatusInOrderByCreatedAtAsc(LocalDate queueDate, Doctor doctor, List<QueueStatus> statuses);
    List<QueueTicket> findByCheckInAppointmentPatientUserUsernameAndQueueDateOrderByCreatedAtDesc(String username, LocalDate queueDate);
    int countByQueueDateAndRoom(LocalDate queueDate, Room room);

    @Query("SELECT q FROM QueueTicket q WHERE q.checkIn = :checkIn ORDER BY q.createdAt ASC")
    List<QueueTicket> findAllByCheckIn(@Param("checkIn") CheckIn checkIn);

    List<QueueTicket> findByQueueNumberContainingIgnoreCaseAndQueueDate(String queueNumber, LocalDate queueDate);

    @Query("SELECT q FROM QueueTicket q WHERE q.queueDate = :queueDate AND q.doctor IS NULL AND q.status = :status ORDER BY q.createdAt ASC")
    List<QueueTicket> findUnassignedWaitingTickets(@Param("queueDate") LocalDate queueDate, @Param("status") QueueStatus status);

    List<QueueTicket> findByQueueDateAndStatus(LocalDate queueDate, QueueStatus status);
}
