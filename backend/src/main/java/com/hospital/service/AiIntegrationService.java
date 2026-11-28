package com.hospital.service;

import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiIntegrationService {

    private final AppointmentRepository appointmentRepository;

    @Value("${app.ai.service-url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(4000);
        return new RestTemplate(factory);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getAiHealth() {
        try {
            ResponseEntity<Map> res = createRestTemplate().getForEntity(aiServiceUrl + "/health", Map.class);
            Map<String, Object> body = res.getBody() != null ? new LinkedHashMap<>(res.getBody()) : new LinkedHashMap<>();
            body.put("aiSource", "KAGGLE_PYTHON_AI");
            return body;
        } catch (Exception ex) {
            log.warn("Python AI service unavailable at {}: {}", aiServiceUrl, ex.getMessage());
            Map<String, Object> offline = new LinkedHashMap<>();
            offline.put("status", "OFFLINE");
            offline.put("aiSource", "OFFLINE");
            offline.put("message", "Dịch vụ Python AI (cổng 8000) chưa khởi động");
            return offline;
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> predictSymptomSpecialty(String symptomText) {
        Map<String, Object> req = new LinkedHashMap<>();
        req.put("symptom_text", symptomText != null ? symptomText : "");

        try {
            ResponseEntity<Map> res = createRestTemplate()
                    .postForEntity(aiServiceUrl + "/predict/symptom", req, Map.class);
            Map<String, Object> body = res.getBody() != null ? new LinkedHashMap<>(res.getBody()) : new LinkedHashMap<>();
            body.put("aiSource", "KAGGLE_PYTHON_AI");
            return body;
        } catch (Exception ex) {
            log.warn("Symptom AI fallback triggered: {}", ex.getMessage());
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("aiSource", "FALLBACK");
            fallback.put("recommended_department_code", "NOI");
            fallback.put("recommended_department_name", "Khoa Nội Tổng Quát");
            fallback.put("recommended_room_hint", "R101 - R102");
            fallback.put("urgency_level", "LOW");
            fallback.put("urgency_text", "Khám sàng lọc tổng quát");
            fallback.put("precautions", List.of("Dịch vụ Python AI đang ngoại tuyến, hệ thống tạm định tuyến về Khoa Nội Tổng Quát"));
            fallback.put("model_name", "Rule Fallback");
            return fallback;
        }
    }

    public Map<String, Object> predictNoShowForAppointment(Long appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn #" + appointmentId));

        Patient patient = appt.getPatient();
        int age = 35;
        String gender = "F";
        int hypertension = 0;
        int diabetes = 0;

        if (patient != null) {
            if (patient.getDob() != null) {
                age = Math.max(0, Math.min(110, Period.between(patient.getDob(), LocalDate.now()).getYears()));
            }
            if (patient.getGender() != null) {
                gender = patient.getGender().toUpperCase().startsWith("M") ? "M" : "F";
            }
            String history = patient.getMedicalHistory() != null ? patient.getMedicalHistory().toLowerCase() : "";
            if (history.contains("huyết áp")) hypertension = 1;
            if (history.contains("đái tháo đường") || history.contains("tiểu đường")) diabetes = 1;
        }

        LocalDate createdDate = appt.getCreatedAt() != null ? appt.getCreatedAt().toLocalDate() : LocalDate.now();
        LocalDate apptDate = appt.getAppointmentDate() != null ? appt.getAppointmentDate() : LocalDate.now();
        long leadDays = Math.max(0, ChronoUnit.DAYS.between(createdDate, apptDate));
        int scheduledHour = appt.getStartTime() != null ? appt.getStartTime().getHour() : 9;
        int dayOfWeek = Math.max(0, apptDate.getDayOfWeek().getValue() - 1);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("gender", gender);
        payload.put("age", age);
        payload.put("lead_time_days", leadDays);
        payload.put("scheduled_hour", scheduledHour);
        payload.put("appt_dayofweek", dayOfWeek);
        payload.put("scholarship", 0);
        payload.put("hypertension", hypertension);
        payload.put("diabetes", diabetes);
        payload.put("alcoholism", 0);
        payload.put("handicap", 0);
        payload.put("sms_received", 1);

        Map<String, Object> result = predictNoShowRaw(payload);
        result.put("appointmentId", appt.getId());
        result.put("patientName", (patient != null && patient.getUser() != null) ? patient.getUser().getFullName() : "Bệnh nhân");
        result.put("leadTimeDays", leadDays);
        result.put("age", age);
        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> predictNoShowRaw(Map<String, Object> payload) {
        try {
            ResponseEntity<Map> res = createRestTemplate()
                    .postForEntity(aiServiceUrl + "/predict/no-show", payload, Map.class);
            Map<String, Object> body = res.getBody() != null ? new LinkedHashMap<>(res.getBody()) : new LinkedHashMap<>();
            body.put("aiSource", "KAGGLE_PYTHON_AI");
            return body;
        } catch (Exception ex) {
            log.warn("No-Show AI fallback triggered: {}", ex.getMessage());
            long lead = payload.get("lead_time_days") instanceof Number ? ((Number) payload.get("lead_time_days")).longValue() : 1L;
            double prob = lead >= 7 ? 0.42 : (lead == 0 ? 0.12 : 0.25);
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("aiSource", "FALLBACK");
            fallback.put("no_show_probability", prob);
            fallback.put("probability_percent", Math.round(prob * 1000.0) / 10.0);
            fallback.put("risk_level", prob >= 0.55 ? "HIGH" : (prob >= 0.35 ? "MEDIUM" : "LOW"));
            fallback.put("risk_label_vi", "Chế độ dự phòng (Python AI chưa bật)");
            fallback.put("recommended_action", "Khởi động D:\\DATN\\AI\\app.py để dùng mô hình RandomForest Kaggle");
            return fallback;
        }
    }
}
