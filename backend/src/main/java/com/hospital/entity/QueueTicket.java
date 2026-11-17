package com.hospital.entity;

import com.hospital.entity.enums.QueueStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_tickets", indexes = {
    @Index(name = "idx_queue_room_date_status", columnList = "room_id, queueDate, status"),
    @Index(name = "idx_queue_number", columnList = "queueNumber"),
    @Index(name = "idx_queue_date_status", columnList = "queueDate, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "check_in_id")
    private CheckIn checkIn;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private LocalDate queueDate;
    private String queueNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private QueueStatus status = QueueStatus.WAITING;

    @Builder.Default
    private int priorityScore = 0;
    
    @Builder.Default
    private int urgencyLevel = 0;
    
    @Builder.Default
    private Boolean isWalkIn = false;
    
    private Integer estimatedWaitMinutes;

    @Builder.Default
    private Boolean isReturnPatient = false;         // came back after lab

    @Enumerated(EnumType.STRING)
    private com.hospital.entity.enums.TriageLevel triageLevel;         // from check-in

    private LocalDateTime lastPriorityCalcAt; // when last recalculated

    private LocalDateTime calledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
