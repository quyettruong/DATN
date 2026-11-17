package com.hospital.service;

import com.hospital.entity.SystemSetting;
import com.hospital.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private final SystemSettingRepository systemSettingRepository;
    private final QueueService queueService;

    private final String startupTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

    @PostConstruct
    public void initSettings() {
        try {
            List<SystemSetting> saved = systemSettingRepository.findAll();
            for (SystemSetting s : saved) {
                if ("queueMode".equals(s.getSettingKey()) && s.getSettingValue() != null) {
                    queueService.setQueueMode(s.getSettingValue());
                } else if ("autoAssign".equals(s.getSettingKey()) && s.getSettingValue() != null) {
                    queueService.setAutoAssignDoctor(Boolean.parseBoolean(s.getSettingValue()));
                }
            }
        } catch (Exception ignored) {
            // Ignore during unit test or before table creation
        }
    }

    public Map<String, String> getAllSettings() {
        Map<String, String> map = new LinkedHashMap<>();
        String currentMode = queueService.getQueueMode() != null ? queueService.getQueueMode() : "PRIORITY";

        map.put("queueMode", currentMode);
        map.put("priorityMode", String.valueOf("PRIORITY".equalsIgnoreCase(currentMode)));
        map.put("autoAssign", String.valueOf(queueService.isAutoAssignDoctor()));
        map.put("emailNotif", "true");
        map.put("smsNotif", "false");
        map.put("appointmentReminder", "true");
        map.put("notifEmail", "admin@medicare.vn");
        map.put("hospitalName", "Bệnh viện Đa khoa Quốc tế MediCare");
        map.put("address", "123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh");
        map.put("phone", "(028) 3930 1234");
        map.put("email", "contact@medicare.vn");
        map.put("bhytDefaultRate", "80");

        for (SystemSetting s : systemSettingRepository.findAll()) {
            if (s.getSettingValue() != null) {
                map.put(s.getSettingKey(), s.getSettingValue());
            }
        }

        // Keep live runtime status authoritative
        map.put("activeQueueMode", queueService.getQueueMode());
        map.put("priorityMode", String.valueOf("PRIORITY".equalsIgnoreCase(queueService.getQueueMode())));
        map.put("autoAssign", String.valueOf(queueService.isAutoAssignDoctor()));
        map.put("startupTime", startupTime);
        map.put("javaVersion", System.getProperty("java.version", "17+"));
        return map;
    }

    @Transactional
    public Map<String, String> updateSettings(Map<String, Object> updates) {
        if (updates == null) {
            return getAllSettings();
        }

        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            if (key == null || entry.getValue() == null) continue;
            if ("startupTime".equals(key) || "javaVersion".equals(key) || "activeQueueMode".equals(key)) continue;

            String val = String.valueOf(entry.getValue()).trim();
            SystemSetting setting = systemSettingRepository.findById(key)
                    .orElseGet(() -> SystemSetting.builder().settingKey(key).build());
            setting.setSettingValue(val);
            systemSettingRepository.save(setting);

            if ("priorityMode".equals(key)) {
                boolean isPriority = Boolean.parseBoolean(val);
                String mode = isPriority ? "PRIORITY" : "FIFO";
                queueService.setQueueMode(mode);
                SystemSetting qm = systemSettingRepository.findById("queueMode")
                        .orElseGet(() -> SystemSetting.builder().settingKey("queueMode").build());
                qm.setSettingValue(mode);
                systemSettingRepository.save(qm);
            } else if ("queueMode".equals(key)) {
                queueService.setQueueMode(val);
            } else if ("autoAssign".equals(key)) {
                queueService.setAutoAssignDoctor(Boolean.parseBoolean(val));
            }
        }

        return getAllSettings();
    }
}
