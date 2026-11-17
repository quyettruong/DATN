package com.hospital.service;

import com.hospital.dto.PrescriptionResponse;
import com.hospital.entity.*;
import com.hospital.exception.BadRequestException;
import com.hospital.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PharmacyServiceTest {

    @Mock
    private DrugInventoryRepository drugInventoryRepository;

    @Mock
    private MedicationRepository medicationRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private PharmacyService pharmacyService;

    private Medication amox;
    private Prescription activePrescription;
    private PrescriptionItem item;

    @BeforeEach
    void setUp() {
        amox = Medication.builder()
                .id(2L)
                .code("M02")
                .name("Amoxicillin 500mg")
                .dosageForm("CAPSULE")
                .build();

        User patUser = User.builder().id(1L).fullName("Lê Thị Mai").build();
        Patient patient = Patient.builder().id(10L).patientCode("BN000001").user(patUser).build();

        activePrescription = Prescription.builder()
                .id(99L)
                .patient(patient)
                .diagnosis("Viêm họng cấp (J02)")
                .status("ACTIVE")
                .build();

        item = PrescriptionItem.builder()
                .id(1001L)
                .prescription(activePrescription)
                .medication(amox)
                .quantity(15)
                .dosage("1 viên")
                .instruction("Uống sau ăn")
                .build();
    }

    @Test
    @DisplayName("1. Xuất thuốc theo chuẩn FEFO trừ lô hết hạn sớm trước và chuyển trạng thái DISPENSED")
    void testDispensePrescription_FEFOAndStatusTransition() {
        DrugInventory earlyLot = DrugInventory.builder()
                .id(1L)
                .medication(amox)
                .lotNumber("LOT-EARLY")
                .expiryDate(LocalDate.now().plusMonths(3))
                .stockQuantity(10)
                .sellingPrice(5000.0)
                .build();

        DrugInventory laterLot = DrugInventory.builder()
                .id(2L)
                .medication(amox)
                .lotNumber("LOT-LATER")
                .expiryDate(LocalDate.now().plusMonths(12))
                .stockQuantity(50)
                .sellingPrice(5000.0)
                .build();

        when(prescriptionRepository.findById(99L)).thenReturn(Optional.of(activePrescription));
        when(prescriptionItemRepository.findByPrescription(activePrescription)).thenReturn(List.of(item));
        when(drugInventoryRepository.findAvailableByMedicationOrderByExpiry(amox)).thenReturn(List.of(earlyLot, laterLot));
        when(drugInventoryRepository.findByMedication(amox)).thenReturn(List.of(earlyLot, laterLot));
        when(drugInventoryRepository.save(any(DrugInventory.class))).thenAnswer(inv -> inv.getArgument(0));
        when(prescriptionRepository.save(any(Prescription.class))).thenAnswer(inv -> inv.getArgument(0));

        PrescriptionResponse response = pharmacyService.dispensePrescription(99L);

        assertThat(earlyLot.getStockQuantity()).isEqualTo(0);
        assertThat(laterLot.getStockQuantity()).isEqualTo(45);
        assertThat(response.getStatus()).isEqualTo("DISPENSED");
    }

    @Test
    @DisplayName("2. Ngăn chặn xuất trùng đơn thuốc đã ở trạng thái DISPENSED")
    void testDispensePrescription_PreventsDoubleDispense() {
        activePrescription.setStatus("DISPENSED");
        when(prescriptionRepository.findById(99L)).thenReturn(Optional.of(activePrescription));

        assertThatThrownBy(() -> pharmacyService.dispensePrescription(99L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("đã được phát");
    }

    @Test
    @DisplayName("3. Báo lỗi khi tổng tồn kho còn hạn không đủ số lượng kê đơn")
    void testDispensePrescription_InsufficientStockThrowsException() {
        DrugInventory tinyLot = DrugInventory.builder()
                .id(1L)
                .medication(amox)
                .lotNumber("LOT-SMALL")
                .expiryDate(LocalDate.now().plusMonths(6))
                .stockQuantity(5)
                .build();

        when(prescriptionRepository.findById(99L)).thenReturn(Optional.of(activePrescription));
        when(prescriptionItemRepository.findByPrescription(activePrescription)).thenReturn(List.of(item));
        when(drugInventoryRepository.findAvailableByMedicationOrderByExpiry(amox)).thenReturn(List.of(tinyLot));

        assertThatThrownBy(() -> pharmacyService.dispensePrescription(99L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Không đủ tồn kho");
    }
}
