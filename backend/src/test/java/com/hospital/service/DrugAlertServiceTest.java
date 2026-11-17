package com.hospital.service;

import com.hospital.dto.DrugCheckRequest;
import com.hospital.dto.DrugCheckResultResponse;
import com.hospital.entity.DrugInteraction;
import com.hospital.entity.Medication;
import com.hospital.entity.Patient;
import com.hospital.repository.DrugInteractionRepository;
import com.hospital.repository.ExaminationRepository;
import com.hospital.repository.MedicationRepository;
import com.hospital.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DrugAlertServiceTest {

    @Mock
    private DrugInteractionRepository drugInteractionRepository;

    @Mock
    private MedicationRepository medicationRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ExaminationRepository examinationRepository;

    @InjectMocks
    private DrugAlertService drugAlertService;

    private Medication ibuprofen;
    private Medication dexamethasone;
    private Medication amoxicillin;
    private Medication paracetamolA;
    private Medication paracetamolB;

    @BeforeEach
    void setUp() {
        ibuprofen = Medication.builder()
                .id(7L)
                .code("M07")
                .name("Ibuprofen 400mg")
                .genericName("Ibuprofen")
                .dosageForm("TABLET")
                .build();

        dexamethasone = Medication.builder()
                .id(9L)
                .code("M09")
                .name("Dexamethasone 0.5mg")
                .genericName("Dexamethasone")
                .dosageForm("TABLET")
                .build();

        amoxicillin = Medication.builder()
                .id(2L)
                .code("M02")
                .name("Amoxicillin 500mg")
                .genericName("Amoxicillin")
                .dosageForm("CAPSULE")
                .build();

        paracetamolA = Medication.builder()
                .id(1L)
                .code("M01")
                .name("Paracetamol 500mg")
                .genericName("Paracetamol")
                .dosageForm("TABLET")
                .build();

        paracetamolB = Medication.builder()
                .id(11L)
                .code("M11")
                .name("Panadol Extra")
                .genericName("Paracetamol")
                .dosageForm("TABLET")
                .build();
    }

    @Test
    @DisplayName("1. Phát hiện tương tác thuốc nguy hiểm: Ibuprofen + Dexamethasone -> CRITICAL")
    void testDrugDrugInteraction_CriticalAlert() {
        DrugInteraction interaction = DrugInteraction.builder()
                .id(1L)
                .medicationA(ibuprofen)
                .medicationB(dexamethasone)
                .severity("CRITICAL")
                .title("Nguy cơ Loét & Xuất huyết Tiêu hóa Nặng")
                .description("Phối hợp NSAID cùng Corticosteroid làm tăng nguy cơ loét dạ dày tá tràng")
                .clinicalAdvice("Hạn chế phối hợp, bổ sung PPI nếu bắt buộc")
                .active(true)
                .build();

        when(medicationRepository.findAllById(anyList())).thenReturn(Arrays.asList(ibuprofen, dexamethasone));
        when(drugInteractionRepository.findByActiveTrue()).thenReturn(Collections.singletonList(interaction));

        DrugCheckRequest request = DrugCheckRequest.builder()
                .medicationIds(Arrays.asList(7L, 9L))
                .build();

        DrugCheckResultResponse response = drugAlertService.checkDrugs(request);

        assertThat(response.isHasCriticalAlert()).isTrue();
        assertThat(response.getTotalAlerts()).isEqualTo(1);
        assertThat(response.getAlerts().get(0).getType()).isEqualTo("INTERACTION");
        assertThat(response.getAlerts().get(0).getTitle()).contains("Loét & Xuất huyết Tiêu hóa");
    }

    @Test
    @DisplayName("2. Phát hiện dị ứng thuốc: Bệnh nhân dị ứng Penicillin khi kê Amoxicillin -> CRITICAL")
    void testPatientAllergy_AmoxicillinPenicillinAllergy() {
        Patient patient = Patient.builder()
                .id(100L)
                .allergies("Penicillin, Dị ứng hải sản")
                .build();

        when(patientRepository.findById(100L)).thenReturn(Optional.of(patient));
        when(medicationRepository.findAllById(anyList())).thenReturn(Collections.singletonList(amoxicillin));

        DrugCheckRequest request = DrugCheckRequest.builder()
                .patientId(100L)
                .medicationIds(Collections.singletonList(2L))
                .build();

        DrugCheckResultResponse response = drugAlertService.checkDrugs(request);

        assertThat(response.isHasCriticalAlert()).isTrue();
        assertThat(response.getAlerts()).isNotEmpty();
        assertThat(response.getAlerts().get(0).getType()).isEqualTo("ALLERGY");
        assertThat(response.getAlerts().get(0).getTitle()).contains("DỊ ỨNG THUỐC");
    }

    @Test
    @DisplayName("3. Chuỗi 'Không ghi nhận dị ứng' không bị kích hoạt báo dị ứng ảo")
    void testPatientAllergy_NegativeAllergyStringIgnored() {
        Patient patient = Patient.builder()
                .id(101L)
                .allergies("Không ghi nhận dị ứng")
                .build();

        when(patientRepository.findById(101L)).thenReturn(Optional.of(patient));
        when(medicationRepository.findAllById(anyList())).thenReturn(Collections.singletonList(amoxicillin));

        DrugCheckRequest request = DrugCheckRequest.builder()
                .patientId(101L)
                .medicationIds(Collections.singletonList(2L))
                .build();

        DrugCheckResultResponse response = drugAlertService.checkDrugs(request);

        assertThat(response.isHasCriticalAlert()).isFalse();
        assertThat(response.getTotalAlerts()).isZero();
    }

    @Test
    @DisplayName("4. Thuốc có genericName rỗng hoặc null không bị báo dị ứng sai")
    void testEmptyOrNullGenericName_DoesNotTriggerFalseAlert() {
        Medication namelessMed = Medication.builder()
                .id(99L)
                .code("M99")
                .name("Thuốc thử nghiệm")
                .genericName("")
                .build();

        Patient patient = Patient.builder()
                .id(102L)
                .allergies("Aspirin")
                .build();

        when(patientRepository.findById(102L)).thenReturn(Optional.of(patient));
        when(medicationRepository.findAllById(anyList())).thenReturn(Collections.singletonList(namelessMed));

        DrugCheckRequest request = DrugCheckRequest.builder()
                .patientId(102L)
                .medicationIds(Collections.singletonList(99L))
                .build();

        DrugCheckResultResponse response = drugAlertService.checkDrugs(request);

        assertThat(response.isHasCriticalAlert()).isFalse();
        assertThat(response.getTotalAlerts()).isZero();
    }

    @Test
    @DisplayName("5. Phát hiện trùng lặp hoạt chất: Paracetamol 500mg + Panadol Extra -> WARNING")
    void testDuplicateActiveIngredient() {
        when(medicationRepository.findAllById(anyList())).thenReturn(Arrays.asList(paracetamolA, paracetamolB));

        DrugCheckRequest request = DrugCheckRequest.builder()
                .medicationIds(Arrays.asList(1L, 11L))
                .build();

        DrugCheckResultResponse response = drugAlertService.checkDrugs(request);

        assertThat(response.isHasWarningAlert()).isTrue();
        assertThat(response.getAlerts().get(0).getType()).isEqualTo("DUPLICATE");
        assertThat(response.getAlerts().get(0).getTitle()).contains("PARACETAMOL");
    }
}
