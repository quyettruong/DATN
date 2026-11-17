package com.hospital.service;

import com.hospital.dto.QueueTicketResponse;
import com.hospital.dto.WalkInCheckInRequest;
import com.hospital.entity.*;
import com.hospital.entity.enums.CheckInStatus;
import com.hospital.entity.enums.QueueStatus;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import com.hospital.websocket.QueueWebSocketController;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final AppointmentRepository appointmentRepository;
    private final CheckInRepository checkInRepository;
    private final QueueTicketRepository queueTicketRepository;
    private final RoomRepository roomRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final ExaminationRepository examinationRepository;
    private final QueueWebSocketController webSocketController;
    private final QueuePriorityService queuePriorityService;
    private final PatientRepository patientRepository;
    private final BillingService billingService;

    @Value("${app.queue.mode:FIFO}")
    private String queueMode;

    private boolean autoAssignDoctor = true;

    public String getQueueMode() {
        return queueMode;
    }

    public void setQueueMode(String mode) {
        if (mode != null && !mode.isBlank()) {
            this.queueMode = mode.trim().toUpperCase();
            if ("PRIORITY".equalsIgnoreCase(this.queueMode)) {
                queuePriorityService.recalculateAllWaiting(LocalDate.now());
            }
        }
    }

    public boolean isAutoAssignDoctor() {
        return autoAssignDoctor;
    }

    public void setAutoAssignDoctor(boolean autoAssignDoctor) {
        this.autoAssignDoctor = autoAssignDoctor;
    }

    @Transactional
    public QueueTicketResponse checkInAndCreateTicket(Long appointmentId, String username) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (checkInRepository.findByAppointment(appointment).isPresent()) {
            throw new BadRequestException("Appointment is already checked in");
        }

        CheckIn checkIn = CheckIn.builder()
                .appointment(appointment)
                .checkedInAt(LocalDateTime.now())
                .status(CheckInStatus.CHECKED_IN)
                .method("COUNTER")
                .build();
        checkIn = checkInRepository.save(checkIn);

        Room room = null;
        if (appointment.getSchedule() != null && appointment.getSchedule().getRoom() != null) {
            room = appointment.getSchedule().getRoom();
        } else if (appointment.getDoctor() != null && appointment.getDoctor().getDepartment() != null) {
            room = roomRepository.findAll().stream()
                    .filter(r -> r.getDepartment() != null && r.getDepartment().getId().equals(appointment.getDoctor().getDepartment().getId()))
                    .findFirst()
                    .orElse(null);
        }
        if (room == null) {
            room = roomRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("Chưa có phòng khám khả dụng trong hệ thống"));
        }
        LocalDate today = LocalDate.now();

        int currentCount = queueTicketRepository.countByQueueDateAndRoom(today, room);
        String queueNumber = String.format("A%03d", currentCount + 1);

        QueueTicket ticket = QueueTicket.builder()
                .checkIn(checkIn)
                .room(room)
                .doctor(appointment.getDoctor())
                .queueDate(today)
                .queueNumber(queueNumber)
                .status(QueueStatus.WAITING)
                .priorityScore(0)
                .isWalkIn(false)
                .urgencyLevel(0)
                .build();

        ticket = queueTicketRepository.save(ticket);
        if ("PRIORITY".equalsIgnoreCase(queueMode)) {
            ticket.setPriorityScore(queuePriorityService.calculatePriorityScore(ticket));
            ticket = queueTicketRepository.save(ticket);
        }
        
        webSocketController.broadcastQueueUpdate(room.getId(), mapToResponse(ticket));
        return mapToResponse(ticket);
    }
    
    @Transactional
    public QueueTicketResponse checkInWalkIn(WalkInCheckInRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        Patient patient;
        if (request.getPatientUserId() != null) {
            User user = userRepository.findById(request.getPatientUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            patient = patientRepository.findByUser(user)
                    .orElseThrow(() -> new BadRequestException("Patient not found"));
        } else {
            String phone = (request.getPhone() != null && !request.getPhone().isBlank())
                    ? request.getPhone().trim()
                    : "09" + String.format("%08d", (int)(Math.random() * 100000000));
            String username = "walkin_" + phone;

            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                user = User.builder()
                        .username(username)
                        .password("$2a$10$w85k2u555XvXwYyBf2v8fOzQhV9F58bI3qQe7fD7F3.0hOQ1jI3gW")
                        .fullName(request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName().trim() : "Bệnh nhân vãng lai")
                        .phone(phone)
                        .role(com.hospital.entity.enums.Role.PATIENT)
                        .enabled(true)
                        .build();
                user = userRepository.save(user);
            }

            final User finalUser = user;
            patient = patientRepository.findByUser(user).orElseGet(() -> {
                String code = "BN" + String.format("%06d", finalUser.getId());
                Patient newPat = Patient.builder()
                        .user(finalUser)
                        .patientCode(code)
                        .dob(request.getDob())
                        .gender(request.getGender() != null ? request.getGender() : "OTHER")
                        .address(request.getAddress())
                        .build();
                return patientRepository.save(newPat);
            });
        }

        Doctor doctor = null;
        if (request.getDoctorId() != null) {
            doctor = doctorRepository.findById(request.getDoctorId()).orElse(null);
        }
        if (doctor == null && autoAssignDoctor && room.getDepartment() != null) {
            List<Doctor> deptDocs = doctorRepository.findByDepartment(room.getDepartment());
            if (!deptDocs.isEmpty()) {
                LocalDate todayCheck = LocalDate.now();
                doctor = deptDocs.stream()
                        .min(Comparator.comparingInt(d -> queueTicketRepository
                                .findByQueueDateAndDoctorAndStatusInOrderByCreatedAtAsc(
                                        todayCheck, d, Arrays.asList(QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_EXAM))
                                .size()))
                        .orElse(deptDocs.get(0));
            }
        }

        LocalDate today = LocalDate.now();
        int currentCount = queueTicketRepository.countByQueueDateAndRoom(today, room);
        String queueNumber = String.format("W%03d", currentCount + 1);

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(today)
                .startTime(java.time.LocalTime.now())
                .status(com.hospital.entity.enums.AppointmentStatus.CONFIRMED)
                .reason(request.getReason() != null ? request.getReason() : "Tiếp nhận khám vãng lai")
                .build();
        appointment = appointmentRepository.save(appointment);

        CheckIn checkIn = CheckIn.builder()
                .appointment(appointment)
                .checkedInAt(LocalDateTime.now())
                .status(CheckInStatus.CHECKED_IN)
                .method("WALK_IN")
                .build();
        checkIn = checkInRepository.save(checkIn);

        QueueTicket ticket = QueueTicket.builder()
                .checkIn(checkIn)
                .room(room)
                .doctor(doctor)
                .queueDate(today)
                .queueNumber(queueNumber)
                .status(QueueStatus.WAITING)
                .isWalkIn(true)
                .urgencyLevel(request.getUrgencyLevel())
                .priorityScore(0)
                .build();

        ticket = queueTicketRepository.save(ticket);
        if ("PRIORITY".equalsIgnoreCase(queueMode)) {
            ticket.setPriorityScore(queuePriorityService.calculatePriorityScore(ticket));
            ticket = queueTicketRepository.save(ticket);
        }

        webSocketController.broadcastQueueUpdate(room.getId(), mapToResponse(ticket));
        return mapToResponse(ticket);
    }
    
    @Transactional
    public void recalculatePriorities(Long roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        List<QueueTicket> tickets = queueTicketRepository.findByQueueDateAndRoomOrderByCreatedAtAsc(LocalDate.now(), room);
        for(QueueTicket t : tickets) {
            if(t.getStatus() == QueueStatus.WAITING) {
                t.setPriorityScore(queuePriorityService.calculatePriorityScore(t));
                queueTicketRepository.save(t);
            }
        }
    }

    public List<QueueTicketResponse> getQueueByRoom(Long roomId, LocalDate date) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        return queueTicketRepository.findByQueueDateAndRoomOrderByCreatedAtAsc(date, room)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<QueueTicketResponse> getQueueByDoctor(String username, LocalDate date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Not a doctor"));

        return queueTicketRepository.findByQueueDateAndDoctorAndStatusInOrderByCreatedAtAsc(date, doctor, 
                Arrays.asList(QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_EXAM))
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<QueueTicketResponse> getMyQueueTicket(String username, LocalDate date) {
        return queueTicketRepository
                .findByCheckInAppointmentPatientUserUsernameAndQueueDateOrderByCreatedAtDesc(username, date)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public QueueTicketResponse callNext(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Not a doctor"));

        List<QueueTicket> tickets = queueTicketRepository.findByQueueDateAndDoctorAndStatusInOrderByCreatedAtAsc(
                LocalDate.now(), doctor, Arrays.asList(QueueStatus.WAITING));

        if (tickets.isEmpty()) {
            List<QueueTicket> unassigned = queueTicketRepository.findUnassignedWaitingTickets(
                    LocalDate.now(), QueueStatus.WAITING);
            if (!unassigned.isEmpty()) {
                QueueTicket picked = unassigned.get(0);
                picked.setDoctor(doctor);
                tickets = Arrays.asList(picked);
            }
        }

        if (tickets.isEmpty()) {
            throw new BadRequestException("No waiting tickets found");
        }
        
        QueueTicket nextTicket;
        if ("PRIORITY".equalsIgnoreCase(queueMode)) {
            // recalculate first to be accurate
            for (QueueTicket t : tickets) {
                t.setPriorityScore(queuePriorityService.calculatePriorityScore(t));
                queueTicketRepository.save(t);
            }
            nextTicket = tickets.stream()
                .max(Comparator.comparing(QueueTicket::getPriorityScore)
                .thenComparing(t -> t.getCreatedAt().getNano() * -1)) // then older
                .orElse(tickets.get(0));
        } else {
            nextTicket = tickets.get(0);
        }

        nextTicket.setStatus(QueueStatus.CALLED);
        nextTicket.setCalledAt(LocalDateTime.now());
        nextTicket = queueTicketRepository.save(nextTicket);

        webSocketController.broadcastQueueUpdate(nextTicket.getRoom().getId(), mapToResponse(nextTicket));
        return mapToResponse(nextTicket);
    }

    @Transactional
    public QueueTicketResponse startExam(Long ticketId, String username) {
        QueueTicket ticket = queueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        requireAssignedDoctor(ticket, username);

        if (ticket.getStatus() != QueueStatus.CALLED && ticket.getStatus() != QueueStatus.IN_EXAM) {
            throw new BadRequestException("Only a called ticket can start an examination");
        }

        ticket.setStatus(QueueStatus.IN_EXAM);
        ticket.setStartedAt(LocalDateTime.now());
        
        QueueTicket examinationTicket = ticket;
        examinationRepository.findByQueueTicket(examinationTicket)
                .orElseGet(() -> {
                    CheckIn ci = examinationTicket.getCheckIn();
                    Appointment appt = ci != null ? ci.getAppointment() : null;
                    String bp = (ci != null && ci.getBloodPressureSystolic() != null && ci.getBloodPressureDiastolic() != null)
                            ? ci.getBloodPressureSystolic() + "/" + ci.getBloodPressureDiastolic()
                            : null;
                    return examinationRepository.save(Examination.builder()
                            .queueTicket(examinationTicket)
                            .doctor(examinationTicket.getDoctor())
                            .patient(appt != null ? appt.getPatient() : null)
                            .symptoms(appt != null ? appt.getReason() : null)
                            .bloodPressure(bp)
                            .heartRate(ci != null ? ci.getHeartRate() : null)
                            .temperature(ci != null ? ci.getTemperature() : null)
                            .weight(ci != null ? ci.getWeight() : null)
                            .height(ci != null ? ci.getHeight() : null)
                            .startedAt(LocalDateTime.now())
                            .build());
                });
        
        ticket = queueTicketRepository.save(ticket);
        webSocketController.broadcastQueueUpdate(ticket.getRoom().getId(), mapToResponse(ticket));
        return mapToResponse(ticket);
    }

    @Transactional
    public QueueTicketResponse completeExam(Long ticketId, String username) {
        QueueTicket ticket = queueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        requireAssignedDoctor(ticket, username);
        ticket.setStatus(QueueStatus.COMPLETED);
        ticket.setCompletedAt(LocalDateTime.now());
        
        if (ticket.getCheckIn() != null && ticket.getCheckIn().getAppointment() != null) {
            Appointment appointment = ticket.getCheckIn().getAppointment();
            appointment.setStatus(com.hospital.entity.enums.AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }

        Examination exam = examinationRepository.findByQueueTicket(ticket)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        exam.setEndedAt(LocalDateTime.now());
        exam = examinationRepository.save(exam);
        billingService.syncExaminationInvoice(exam);
        
        ticket = queueTicketRepository.save(ticket);
        webSocketController.broadcastQueueUpdate(ticket.getRoom().getId(), mapToResponse(ticket));
        return mapToResponse(ticket);
    }

    @Transactional
    public QueueTicketResponse skipTicket(Long ticketId, String username) {
        QueueTicket ticket = queueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        requireAssignedDoctor(ticket, username);
        ticket.setStatus(QueueStatus.SKIPPED);
        ticket = queueTicketRepository.save(ticket);
        
        webSocketController.broadcastQueueUpdate(ticket.getRoom().getId(), mapToResponse(ticket));
        return mapToResponse(ticket);
    }

    @Transactional
    public QueueTicketResponse requeueAfterLabResults(Long examinationId) {
        Examination examination = examinationRepository.findById(examinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        QueueTicket originalTicket = examination.getQueueTicket();
        if (originalTicket == null) {
            return null;
        }

        // If the original ticket is still actively being examined/waiting/called, just refresh WS without duplicating
        if (originalTicket.getStatus() == QueueStatus.IN_EXAM
                || originalTicket.getStatus() == QueueStatus.WAITING
                || originalTicket.getStatus() == QueueStatus.CALLED) {
            if (originalTicket.getRoom() != null) {
                webSocketController.broadcastQueueUpdate(originalTicket.getRoom().getId(), mapToResponse(originalTicket));
            }
            return mapToResponse(originalTicket);
        }

        // Prevent duplicate return tickets for the same check-in
        if (originalTicket.getCheckIn() != null) {
            List<QueueTicket> existingTickets = queueTicketRepository.findAllByCheckIn(originalTicket.getCheckIn());
            QueueTicket activeReturn = existingTickets.stream()
                    .filter(t -> Boolean.TRUE.equals(t.getIsReturnPatient()) && t.getStatus() != QueueStatus.COMPLETED && t.getStatus() != QueueStatus.SKIPPED)
                    .findFirst()
                    .orElse(null);
            if (activeReturn != null) {
                return mapToResponse(activeReturn);
            }
        }
        
        String newQueueNumber = originalTicket.getQueueNumber().endsWith("-R")
                ? originalTicket.getQueueNumber()
                : originalTicket.getQueueNumber() + "-R";
        
        QueueTicket returnTicket = QueueTicket.builder()
                .checkIn(originalTicket.getCheckIn())
                .room(originalTicket.getRoom())
                .doctor(originalTicket.getDoctor())
                .queueDate(LocalDate.now())
                .queueNumber(newQueueNumber)
                .status(QueueStatus.WAITING)
                .isWalkIn(originalTicket.getIsWalkIn())
                .isReturnPatient(true)
                .triageLevel(originalTicket.getTriageLevel())
                .urgencyLevel(8)
                .build();
                
        returnTicket = queueTicketRepository.save(returnTicket);
        if ("PRIORITY".equalsIgnoreCase(queueMode)) {
            returnTicket.setPriorityScore(queuePriorityService.calculatePriorityScore(returnTicket));
            returnTicket = queueTicketRepository.save(returnTicket);
        }
        if (returnTicket.getRoom() != null) {
            webSocketController.broadcastQueueUpdate(returnTicket.getRoom().getId(), mapToResponse(returnTicket));
        }
        
        return mapToResponse(returnTicket);
    }

    public List<QueueTicketResponse> lookupTicket(String query, LocalDate date) {
        if (date == null) date = LocalDate.now();
        return queueTicketRepository.findByQueueNumberContainingIgnoreCaseAndQueueDate(query.trim(), date)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private QueueTicketResponse mapToResponse(QueueTicket ticket) {
        Appointment appt = (ticket.getCheckIn() != null) ? ticket.getCheckIn().getAppointment() : null;
        Patient pat = (appt != null) ? appt.getPatient() : null;
        String patientName = (pat != null && pat.getUser() != null)
                ? pat.getUser().getFullName() : "Bệnh nhân";
        String patientCode = (pat != null) ? pat.getPatientCode() : null;
        String reason = (appt != null) ? appt.getReason() : null;
        String doctorName = (ticket.getDoctor() != null && ticket.getDoctor().getUser() != null)
                ? ticket.getDoctor().getUser().getFullName() : "Chưa phân công";
        String roomName = (ticket.getRoom() != null) ? ticket.getRoom().getName() : "Chưa xếp phòng";
        return QueueTicketResponse.builder()
                .id(ticket.getId())
                .queueNumber(ticket.getQueueNumber())
                .patientName(patientName)
                .patientCode(patientCode)
                .doctorName(doctorName)
                .roomName(roomName)
                .status(ticket.getStatus())
                .triageLevel(ticket.getTriageLevel() != null ? ticket.getTriageLevel()
                        : (ticket.getCheckIn() != null ? ticket.getCheckIn().getTriageLevel() : null))
                .isWalkIn(ticket.getIsWalkIn())
                .isReturnPatient(ticket.getIsReturnPatient())
                .reason(reason)
                .priorityScore(ticket.getPriorityScore())
                .estimatedWaitMinutes(ticket.getEstimatedWaitMinutes())
                .queueDate(ticket.getQueueDate())
                .calledAt(ticket.getCalledAt())
                .createdAt(ticket.getCreatedAt())
                .build();
    }

    private void requireAssignedDoctor(QueueTicket ticket, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Not a doctor"));
        if (ticket.getDoctor() == null || !ticket.getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("Ticket is not assigned to this doctor");
        }
    }
}
