package com.hospital.service;

import com.hospital.dto.CheckInResponse;
import com.hospital.dto.TriageRequest;
import com.hospital.entity.CheckIn;
import com.hospital.entity.QueueTicket;
import com.hospital.entity.enums.TriageLevel;
import com.hospital.repository.CheckInRepository;
import com.hospital.repository.QueueTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TriageService {

    private final CheckInRepository checkInRepository;
    private final QueueTicketRepository queueTicketRepository;
    private final QueuePriorityService queuePriorityService;
    private final QueueService queueService;

    public List<CheckInResponse> getPendingTriageCheckIns() {
        return checkInRepository.findByTriageLevelIsNullOrderByCheckedInAtAsc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public CheckInResponse recordTriage(Long checkInId, TriageRequest request, String nurseUsername) {
        CheckIn checkIn = checkInRepository.findById(checkInId)
                .orElseThrow(() -> new RuntimeException("CheckIn not found"));

        checkIn.setBloodPressureSystolic(request.getBloodPressureSystolic());
        checkIn.setBloodPressureDiastolic(request.getBloodPressureDiastolic());
        checkIn.setHeartRate(request.getHeartRate());
        checkIn.setTemperature(request.getTemperature());
        checkIn.setWeight(request.getWeight());
        checkIn.setHeight(request.getHeight());
        checkIn.setSpO2(request.getSpO2());

        TriageLevel level = request.getTriageLevel() != null ? request.getTriageLevel() : suggestTriageLevel(request);
        checkIn.setTriageLevel(level);
        checkIn.setTriagedAt(LocalDateTime.now());
        checkIn.setTriagedByUsername(nurseUsername);

        checkInRepository.save(checkIn);

        // Update corresponding QueueTicket
        queueTicketRepository.findAllByCheckIn(checkIn).forEach(ticket -> {
            ticket.setTriageLevel(level);
            ticket.setPriorityScore(queuePriorityService.calculatePriorityScore(ticket));
            queueTicketRepository.save(ticket);
        });

        return mapToResponse(checkIn);
    }

    public TriageLevel suggestTriageLevel(TriageRequest vitals) {
        Double temp = vitals.getTemperature();
        Integer spo2 = vitals.getSpO2();
        Integer hr = vitals.getHeartRate();
        Integer sbp = vitals.getBloodPressureSystolic();

        if ((temp != null && temp > 39.5) || 
            (spo2 != null && spo2 < 90) || 
            (hr != null && (hr < 40 || hr > 150)) || 
            (sbp != null && (sbp > 180 || sbp < 80))) {
            return TriageLevel.LEVEL_2_EMERGENCY;
        }

        if ((temp != null && temp > 38.5) || 
            (spo2 != null && spo2 < 94) || 
            (hr != null && (hr < 50 || hr > 120)) || 
            (sbp != null && sbp > 160)) {
            return TriageLevel.LEVEL_3_URGENT;
        }

        return TriageLevel.LEVEL_4_SEMI_URGENT;
    }

    private CheckInResponse mapToResponse(CheckIn checkIn) {
        CheckInResponse res = new CheckInResponse();
        res.setId(checkIn.getId());
        if (checkIn.getAppointment() != null) {
            res.setAppointmentId(checkIn.getAppointment().getId());
            if (checkIn.getAppointment().getPatient() != null) {
                res.setPatientName(checkIn.getAppointment().getPatient().getUser() != null ? checkIn.getAppointment().getPatient().getUser().getFullName() : "Unknown");
                res.setPatientCode(checkIn.getAppointment().getPatient().getPatientCode());
            }
        }
        queueTicketRepository.findAllByCheckIn(checkIn).stream()
                .findFirst()
                .ifPresent(ticket -> res.setQueueNumber(ticket.getQueueNumber()));
        res.setTriageLevel(checkIn.getTriageLevel());
        res.setBloodPressureSystolic(checkIn.getBloodPressureSystolic());
        res.setBloodPressureDiastolic(checkIn.getBloodPressureDiastolic());
        res.setHeartRate(checkIn.getHeartRate());
        res.setTemperature(checkIn.getTemperature());
        res.setWeight(checkIn.getWeight());
        res.setHeight(checkIn.getHeight());
        res.setSpO2(checkIn.getSpO2());
        res.setCheckedInAt(checkIn.getCheckedInAt());
        res.setTriagedAt(checkIn.getTriagedAt());
        if (checkIn.getStatus() != null) res.setStatus(checkIn.getStatus().name());
        
        return res;
    }
}
