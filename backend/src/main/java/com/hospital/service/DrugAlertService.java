package com.hospital.service;

import com.hospital.dto.DrugAlertItem;
import com.hospital.dto.DrugCheckRequest;
import com.hospital.dto.DrugCheckResultResponse;
import com.hospital.entity.DrugInteraction;
import com.hospital.entity.Examination;
import com.hospital.entity.Medication;
import com.hospital.entity.Patient;
import com.hospital.repository.DrugInteractionRepository;
import com.hospital.repository.ExaminationRepository;
import com.hospital.repository.MedicationRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DrugAlertService {

    private final DrugInteractionRepository drugInteractionRepository;
    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;
    private final ExaminationRepository examinationRepository;

    public DrugCheckResultResponse checkDrugs(DrugCheckRequest request) {
        List<DrugAlertItem> alerts = new ArrayList<>();

        if (request.getMedicationIds() == null || request.getMedicationIds().isEmpty()) {
            return DrugCheckResultResponse.builder()
                    .hasCriticalAlert(false)
                    .hasWarningAlert(false)
                    .totalAlerts(0)
                    .alerts(alerts)
                    .build();
        }

        List<Long> medIds = request.getMedicationIds().stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        List<Medication> medications = medicationRepository.findAllById(medIds);
        Map<Long, Medication> medMap = medications.stream()
                .collect(Collectors.toMap(Medication::getId, m -> m, (m1, m2) -> m1));

        // 1. Resolve Patient
        Patient patient = null;
        if (request.getPatientId() != null) {
            patient = patientRepository.findById(request.getPatientId()).orElse(null);
        } else if (request.getExaminationId() != null) {
            Examination exam = examinationRepository.findById(request.getExaminationId()).orElse(null);
            if (exam != null) {
                patient = exam.getPatient();
            }
        }

        // 2. Check Patient Allergies
        if (patient != null && patient.getAllergies() != null && !patient.getAllergies().trim().isEmpty()) {
            checkAllergies(patient.getAllergies(), medications, alerts);
        }

        // 3. Check Drug-Drug Interactions
        checkDrugInteractions(medIds, medMap, alerts);

        // 4. Check Duplicate Active Ingredients
        checkDuplicateIngredients(medications, alerts);

        // Sort: CRITICAL first, then WARNING, then INFO
        alerts.sort((a, b) -> {
            int scoreA = getSeverityScore(a.getSeverity());
            int scoreB = getSeverityScore(b.getSeverity());
            return Integer.compare(scoreB, scoreA);
        });

        boolean hasCritical = alerts.stream().anyMatch(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity()));
        boolean hasWarning = alerts.stream().anyMatch(a -> "WARNING".equalsIgnoreCase(a.getSeverity()));

        return DrugCheckResultResponse.builder()
                .hasCriticalAlert(hasCritical)
                .hasWarningAlert(hasWarning)
                .totalAlerts(alerts.size())
                .alerts(alerts)
                .build();
    }

    private void checkAllergies(String allergiesStr, List<Medication> medications, List<DrugAlertItem> alerts) {
        String lowerAllergies = allergiesStr.toLowerCase();
        String[] allergyTokens = lowerAllergies.split("[,;\\n]+");

        for (Medication med : medications) {
            String medName = (med.getName() != null) ? med.getName().toLowerCase() : "";
            String genericName = (med.getGenericName() != null) ? med.getGenericName().toLowerCase() : "";

            for (String rawToken : allergyTokens) {
                String token = rawToken.trim();
                if (token.isEmpty() || token.length() < 3) continue;

                // Ignore negative allergy declarations
                if (token.contains("không") || token.contains("chưa") || token.equals("none") || token.equals("null")) {
                    continue;
                }

                boolean matched = false;
                String matchedClass = token;

                boolean hasValidName = medName != null && medName.trim().length() >= 3;
                boolean hasValidGeneric = genericName != null && genericName.trim().length() >= 3;

                if ((hasValidName && medName.contains(token)) 
                        || (hasValidGeneric && (genericName.contains(token) || token.contains(genericName)))) {
                    matched = true;
                }
                // Group: Penicillin / Beta-lactam
                else if (token.contains("penicillin") || token.contains("beta-lactam")) {
                    if ((hasValidGeneric && (genericName.contains("amoxicillin") || genericName.contains("ampicillin") || genericName.contains("penicillin")))
                            || (hasValidName && (medName.contains("amoxicillin") || medName.contains("penicillin")))) {
                        matched = true;
                        matchedClass = "Nhóm Penicillin / Beta-lactam";
                    }
                }
                // Group: Aspirin / NSAID
                else if (token.contains("aspirin") || token.contains("nsaid")) {
                    if ((hasValidGeneric && (genericName.contains("ibuprofen") || genericName.contains("aspirin") || genericName.contains("meloxicam") || genericName.contains("diclofenac")))
                            || (hasValidName && (medName.contains("ibuprofen") || medName.contains("aspirin")))) {
                        matched = true;
                        matchedClass = "Nhóm NSAID / Aspirin";
                    }
                }
                // Group: Paracetamol
                else if (token.contains("paracetamol") || token.contains("acetaminophen")) {
                    if ((hasValidGeneric && (genericName.contains("paracetamol") || genericName.contains("acetaminophen")))
                            || (hasValidName && (medName.contains("paracetamol") || medName.contains("panadol")))) {
                        matched = true;
                        matchedClass = "Paracetamol (Acetaminophen)";
                    }
                }
                // Group: Cephalosporin
                else if (token.contains("cephalosporin") || token.contains("cepha")) {
                    if ((hasValidGeneric && genericName.startsWith("cef")) || (hasValidName && medName.startsWith("cef"))) {
                        matched = true;
                        matchedClass = "Nhóm Cephalosporin";
                    }
                }

                if (matched) {
                    alerts.add(DrugAlertItem.builder()
                            .type("ALLERGY")
                            .severity("CRITICAL")
                            .title("CẢNH BÁO DỊ ỨNG THUỐC: " + med.getName())
                            .medicationNames(med.getName() + " (" + (med.getGenericName() != null ? med.getGenericName() : "") + ")")
                            .description("Bệnh nhân có tiền sử dị ứng được ghi nhận với: '" + token.toUpperCase() + 
                                         "'. Thuốc này (" + med.getName() + ") thuộc nhóm nguy cơ cao gây phản ứng dị ứng hoặc sốc phản vệ!")
                            .clinicalAdvice("CHỐNG CHỈ ĐỊNH. Đổi ngay sang nhóm dược chất khác không có phản ứng dị ứng chéo.")
                            .build());
                    break; // One allergy alert per medication is enough
                }
            }
        }
    }

    private void checkDrugInteractions(List<Long> medIds, Map<Long, Medication> medMap, List<DrugAlertItem> alerts) {
        if (medIds.size() < 2) return;

        List<DrugInteraction> interactions = drugInteractionRepository.findByActiveTrue();
        Set<String> processedPairs = new HashSet<>();

        for (DrugInteraction inter : interactions) {
            Long idA = (inter.getMedicationA() != null) ? inter.getMedicationA().getId() : null;
            Long idB = (inter.getMedicationB() != null) ? inter.getMedicationB().getId() : null;

            if (idA != null && idB != null && medMap.containsKey(idA) && medMap.containsKey(idB)) {
                String pairKey = Math.min(idA, idB) + "_" + Math.max(idA, idB);
                if (!processedPairs.contains(pairKey)) {
                    processedPairs.add(pairKey);
                    Medication medA = medMap.get(idA);
                    Medication medB = medMap.get(idB);

                    alerts.add(DrugAlertItem.builder()
                            .type("INTERACTION")
                            .severity(inter.getSeverity())
                            .title("TƯƠNG TÁC THUỐC: " + inter.getTitle())
                            .medicationNames(medA.getName() + " ↔ " + medB.getName())
                            .description(inter.getDescription())
                            .clinicalAdvice(inter.getClinicalAdvice())
                            .build());
                }
            }
        }
    }

    private void checkDuplicateIngredients(List<Medication> medications, List<DrugAlertItem> alerts) {
        Map<String, List<Medication>> genericGroups = new HashMap<>();

        for (Medication med : medications) {
            if (med.getGenericName() != null && !med.getGenericName().trim().isEmpty()) {
                String norm = med.getGenericName().trim().toLowerCase();
                genericGroups.computeIfAbsent(norm, k -> new ArrayList<>()).add(med);
            }
        }

        for (Map.Entry<String, List<Medication>> entry : genericGroups.entrySet()) {
            if (entry.getValue().size() > 1) {
                String names = entry.getValue().stream().map(Medication::getName).collect(Collectors.joining(" & "));
                alerts.add(DrugAlertItem.builder()
                        .type("DUPLICATE")
                        .severity("WARNING")
                        .title("TRÙNG LẶP HOẠT CHẤT: " + entry.getKey().toUpperCase())
                        .medicationNames(names)
                        .description("Đơn thuốc chứa nhiều chế phẩm cùng hoạt chất '" + entry.getKey() + "'. Nguy cơ quá liều độc tính và tích lũy nồng độ trong huyết tương.")
                        .clinicalAdvice("Kiểm tra lại tổng liều dùng hàng ngày của hoạt chất này hoặc loại bỏ bớt chế phẩm trùng lặp.")
                        .build());
            }
        }
    }

    private int getSeverityScore(String severity) {
        if ("CRITICAL".equalsIgnoreCase(severity)) return 3;
        if ("WARNING".equalsIgnoreCase(severity)) return 2;
        return 1;
    }
}
