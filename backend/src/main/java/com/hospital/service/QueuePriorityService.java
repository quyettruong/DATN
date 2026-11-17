package com.hospital.service;

import com.hospital.entity.Patient;
import com.hospital.entity.QueueTicket;
import com.hospital.entity.enums.QueueStatus;
import com.hospital.repository.QueueTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QueuePriorityService {

    private final QueueTicketRepository queueTicketRepository;

    public int calculatePriorityScore(QueueTicket ticket) {
        int score = 0;
        score += ticket.getUrgencyLevel() * 3;

        if (ticket.getCreatedAt() != null) {
            long waitMinutes = Math.max(0, ChronoUnit.MINUTES.between(ticket.getCreatedAt(), LocalDateTime.now()));
            score += (int) (waitMinutes / 10) * 2;
        }

        if (Boolean.FALSE.equals(ticket.getIsWalkIn())) score += 6;

        Patient patient = findPatientFromTicket(ticket);
        if (patient != null && patient.getDob() != null) {
            int age = Period.between(patient.getDob(), LocalDate.now()).getYears();
            if (age >= 75) score += 5;
            else if (age >= 65) score += 3;
        }

        if (Boolean.TRUE.equals(ticket.getIsReturnPatient())) {
            score += 50;
        }

        if (ticket.getTriageLevel() != null) {
            switch (ticket.getTriageLevel()) {
                case LEVEL_1_RESUSCITATION: score += 100; break;
                case LEVEL_2_EMERGENCY: score += 80; break;
                case LEVEL_3_URGENT: score += 60; break;
                case LEVEL_4_SEMI_URGENT: score += 30; break;
                case LEVEL_5_NON_URGENT: score += 10; break;
            }
        }

        return score;
    }

    private Patient findPatientFromTicket(QueueTicket ticket) {
        if (ticket.getCheckIn() != null && ticket.getCheckIn().getAppointment() != null) {
            return ticket.getCheckIn().getAppointment().getPatient();
        }
        return null;
    }

    @Transactional
    public void recalculateAllWaiting(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<QueueTicket> waitingTickets = queueTicketRepository.findByQueueDateAndStatus(targetDate, QueueStatus.WAITING);
        for (QueueTicket ticket : waitingTickets) {
            ticket.setPriorityScore(calculatePriorityScore(ticket));
            queueTicketRepository.save(ticket);
        }
    }

    @Transactional
    public void recalculateAllWaiting(Long roomId, LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<QueueTicket> waitingTickets = queueTicketRepository.findByQueueDateAndStatus(targetDate, QueueStatus.WAITING);
        for (QueueTicket ticket : waitingTickets) {
            if (roomId == null || (ticket.getRoom() != null && roomId.equals(ticket.getRoom().getId()))) {
                ticket.setPriorityScore(calculatePriorityScore(ticket));
                queueTicketRepository.save(ticket);
            }
        }
    }
}
