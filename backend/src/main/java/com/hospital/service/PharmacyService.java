package com.hospital.service;

import com.hospital.dto.DrugInventoryResponse;
import com.hospital.dto.PrescriptionItemResponse;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.entity.*;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final DrugInventoryRepository drugInventoryRepository;
    private final MedicationRepository medicationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final InvoiceRepository invoiceRepository;

    public List<PrescriptionResponse> getPrescriptionsForPharmacy() {
        return prescriptionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapPrescriptionForPharmacy)
                .collect(Collectors.toList());
    }

    public Map<Long, Integer> checkStockAvailability(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thuốc"));

        Map<Long, Integer> availability = new HashMap<>();
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescription(prescription);
        for (PrescriptionItem item : items) {
            if (item.getMedication() != null) {
                Integer totalStock = getTotalAvailableNonExpiredStock(item.getMedication());
                availability.put(item.getMedication().getId(), totalStock);
            }
        }
        return availability;
    }

    @Transactional
    public PrescriptionResponse dispensePrescription(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thuốc #" + prescriptionId));

        if ("DISPENSED".equalsIgnoreCase(prescription.getStatus())) {
            throw new BadRequestException("Đơn thuốc này đã được phát và trừ kho trước đó");
        }
        if ("CANCELLED".equalsIgnoreCase(prescription.getStatus())) {
            throw new BadRequestException("Không thể phát đơn thuốc đã hủy");
        }

        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescription(prescription);
        if (items.isEmpty()) {
            throw new BadRequestException("Đơn thuốc không có danh mục thuốc để phát");
        }

        for (PrescriptionItem item : items) {
            Medication medication = item.getMedication();
            if (medication == null) continue;
            int requiredQty = Math.max(1, item.getQuantity());

            List<DrugInventory> inventoryList = drugInventoryRepository.findAvailableByMedicationOrderByExpiry(medication);
            int availableTotal = inventoryList.stream()
                    .mapToInt(inv -> inv.getStockQuantity() != null ? inv.getStockQuantity() : 0)
                    .sum();

            if (availableTotal < requiredQty) {
                throw new BadRequestException("Không đủ tồn kho khả dụng cho thuốc " + medication.getName()
                        + " (Cần: " + requiredQty + ", Còn hạn trong kho: " + availableTotal + ")");
            }

            for (DrugInventory inv : inventoryList) {
                if (requiredQty <= 0) break;

                int currentLotStock = inv.getStockQuantity() != null ? inv.getStockQuantity() : 0;
                if (currentLotStock >= requiredQty) {
                    inv.setStockQuantity(currentLotStock - requiredQty);
                    requiredQty = 0;
                } else {
                    requiredQty -= currentLotStock;
                    inv.setStockQuantity(0);
                }
                drugInventoryRepository.save(inv);
            }
        }

        prescription.setStatus("DISPENSED");
        prescription = prescriptionRepository.save(prescription);

        return mapPrescriptionForPharmacy(prescription);
    }

    public List<DrugInventoryResponse> getAllInventory() {
        return drugInventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DrugInventoryResponse> getLowStockAlerts() {
        return drugInventoryRepository.findLowStock().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DrugInventoryResponse> getExpiringSoonAlerts() {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return drugInventoryRepository.findByExpiryDateBefore(thirtyDaysFromNow).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DrugInventoryResponse addStock(Long medicationId, String lotNumber, LocalDate expiryDate, Integer quantity, Double costPrice, Double sellingPrice) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Số lượng nhập kho phải lớn hơn 0");
        }
        if ((costPrice != null && costPrice < 0) || (sellingPrice != null && sellingPrice < 0)) {
            throw new BadRequestException("Đơn giá nhập và giá bán không được âm");
        }
        if (expiryDate != null && !expiryDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Hạn sử dụng của lô thuốc nhập mới phải lớn hơn ngày hiện tại");
        }
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found"));

        DrugInventory inventory = DrugInventory.builder()
                .medication(medication)
                .lotNumber(lotNumber)
                .expiryDate(expiryDate)
                .stockQuantity(quantity)
                .costPrice(costPrice)
                .sellingPrice(sellingPrice)
                .reorderLevel(50)
                .build();

        return mapToResponse(drugInventoryRepository.save(inventory));
    }

    public Integer getTotalStock(Long medicationId) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found"));
        return getTotalAvailableNonExpiredStock(medication);
    }

    private Integer getTotalAvailableNonExpiredStock(Medication medication) {
        return drugInventoryRepository.findAvailableByMedicationOrderByExpiry(medication).stream()
                .mapToInt(inv -> inv.getStockQuantity() != null ? inv.getStockQuantity() : 0)
                .sum();
    }

    public Double getSellingPrice(Long medicationId) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found"));
        return getSellingPriceByEntity(medication);
    }

    private Double getSellingPriceByEntity(Medication medication) {
        if (medication == null) return 0.0;
        return drugInventoryRepository.findByMedication(medication).stream()
                .filter(inv -> inv.getSellingPrice() != null && inv.getSellingPrice() > 0)
                .map(DrugInventory::getSellingPrice)
                .findFirst()
                .orElse(0.0);
    }

    private PrescriptionResponse mapPrescriptionForPharmacy(Prescription prescription) {
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescription(prescription);
        List<PrescriptionItemResponse> itemResponses = items.stream().map(i -> {
            Medication med = i.getMedication();
            Integer stock = med != null ? getTotalAvailableNonExpiredStock(med) : 0;
            Double unitPrice = med != null ? getSellingPriceByEntity(med) : 0.0;
            return PrescriptionItemResponse.builder()
                    .id(i.getId())
                    .medicationId(med != null ? med.getId() : null)
                    .medicationName(med != null ? med.getName() : "Dược phẩm")
                    .dosageForm(med != null ? med.getDosageForm() : null)
                    .dosage(i.getDosage())
                    .frequency(i.getFrequency())
                    .duration(i.getDuration())
                    .quantity(i.getQuantity())
                    .instruction(i.getInstruction())
                    .availableStock(stock)
                    .unitPrice(unitPrice)
                    .build();
        }).collect(Collectors.toList());

        String invoiceStatus = "UNPAID";
        if (prescription.getExamination() != null) {
            Optional<Invoice> invOpt = invoiceRepository.findByExamination(prescription.getExamination());
            if (invOpt.isPresent() && invOpt.get().getStatus() != null) {
                invoiceStatus = invOpt.get().getStatus().name();
            }
        }

        Patient patient = prescription.getPatient();
        Doctor doctor = prescription.getDoctor();

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .examinationId(prescription.getExamination() != null ? prescription.getExamination().getId() : null)
                .doctorName(doctor != null && doctor.getUser() != null ? doctor.getUser().getFullName() : "Bác sĩ điều trị")
                .patientId(patient != null ? patient.getId() : null)
                .patientName(patient != null && patient.getUser() != null ? patient.getUser().getFullName() : "Bệnh nhân")
                .patientCode(patient != null ? patient.getPatientCode() : null)
                .patientAllergies(patient != null ? patient.getAllergies() : null)
                .patientBloodType(patient != null ? patient.getBloodType() : null)
                .diagnosis(prescription.getDiagnosis())
                .notes(prescription.getNotes())
                .status(prescription.getStatus() != null ? prescription.getStatus() : "ACTIVE")
                .invoiceStatus(invoiceStatus)
                .items(itemResponses)
                .prescribedAt(prescription.getPrescribedAt())
                .createdAt(prescription.getCreatedAt() != null ? prescription.getCreatedAt() : prescription.getPrescribedAt())
                .build();
    }

    private DrugInventoryResponse mapToResponse(DrugInventory inv) {
        DrugInventoryResponse res = new DrugInventoryResponse();
        res.setId(inv.getId());
        if (inv.getMedication() != null) {
            res.setMedicationId(inv.getMedication().getId());
            res.setMedicationName(inv.getMedication().getName());
            res.setGenericName(inv.getMedication().getGenericName());
            res.setDosageForm(inv.getMedication().getDosageForm());
            res.setStrength(inv.getMedication().getStrength());
        }
        res.setLotNumber(inv.getLotNumber());
        res.setExpiryDate(inv.getExpiryDate());
        res.setStockQuantity(inv.getStockQuantity());
        res.setReorderLevel(inv.getReorderLevel());
        res.setIsLowStock(inv.getStockQuantity() <= inv.getReorderLevel());
        res.setIsExpiringSoon(inv.getExpiryDate() != null && inv.getExpiryDate().isBefore(LocalDate.now().plusDays(30)));
        res.setSellingPrice(inv.getSellingPrice());
        return res;
    }
}
