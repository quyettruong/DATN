package com.hospital.service;

import com.hospital.dto.DiscountRequest;
import com.hospital.dto.InvoiceResponse;
import com.hospital.dto.PaymentRequest;
import com.hospital.entity.*;
import com.hospital.entity.enums.InvoiceStatus;
import com.hospital.entity.enums.LabOrderStatus;
import com.hospital.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceItemRepository invoiceItemRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private ExaminationRepository examinationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LabOrderRepository labOrderRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private DrugInventoryRepository drugInventoryRepository;

    @InjectMocks
    private BillingService billingService;

    private Patient patient;
    private User patientUser;

    @BeforeEach
    void setUp() {
        patientUser = User.builder()
                .id(1L)
                .fullName("Nguyễn Thị Mai")
                .username("patient1")
                .build();

        patient = Patient.builder()
                .id(10L)
                .patientCode("BN000001")
                .user(patientUser)
                .build();
    }

    @Test
    @DisplayName("1. Tạo hóa đơn tự động tính phí khám ban đầu 150.000 VNĐ")
    void testCreateInvoice_CalculatesConsultationFee() {
        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice inv = invocation.getArgument(0);
            inv.setId(100L);
            return inv;
        });

        InvoiceResponse response = billingService.createInvoice(10L, null, null);

        assertThat(response).isNotNull();
        assertThat(response.getConsultationFee()).isEqualTo(150000.0);
        assertThat(response.getTotalAmount()).isEqualTo(150000.0);
        assertThat(response.getPatientName()).isEqualTo("Nguyễn Thị Mai");
    }

    @Test
    @DisplayName("2. Xử lý thanh toán thành công chuyển trạng thái hóa đơn sang PAID")
    void testProcessPayment_UpdatesStatusToPaid() {
        Invoice invoice = Invoice.builder()
                .id(200L)
                .invoiceNumber("INV-20261106-00001")
                .patient(patient)
                .totalAmount(150000.0)
                .paidAmount(0.0)
                .status(InvoiceStatus.UNPAID)
                .build();

        when(invoiceRepository.findById(200L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));
        when(invoiceItemRepository.findByInvoice(any(Invoice.class))).thenReturn(Collections.emptyList());

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .amount(150000.0)
                .paymentMethod(com.hospital.entity.enums.PaymentMethod.TRANSFER)
                .notes("Thanh toan VietQR")
                .build();

        InvoiceResponse response = billingService.processPayment(200L, paymentRequest);

        assertThat(response.getStatus()).isEqualTo(InvoiceStatus.PAID);
        assertThat(response.getPaidAmount()).isEqualTo(150000.0);
    }

    @Test
    @DisplayName("3. Đồng bộ tự động phí khám + cận lâm sàng + thuốc theo đơn vào hóa đơn")
    void testSyncExaminationInvoice_AggregatesAllFees() {
        Examination exam = Examination.builder()
                .id(50L)
                .patient(patient)
                .build();

        LabTest xray = LabTest.builder().id(7L).code("XRAY").name("X-quang ngực thẳng").price(180000.0).build();
        LabOrder labOrder = LabOrder.builder().id(501L).examination(exam).labTest(xray).status(LabOrderStatus.ORDERED).build();

        Medication para = Medication.builder().id(1L).code("M01").name("Paracetamol 500mg").build();
        Prescription presc = Prescription.builder().id(601L).examination(exam).patient(patient).status("ACTIVE").build();
        PrescriptionItem prescItem = PrescriptionItem.builder().id(701L).prescription(presc).medication(para).quantity(10).build();
        DrugInventory lot = DrugInventory.builder().id(801L).medication(para).sellingPrice(2000.0).stockQuantity(100).expiryDate(LocalDate.now().plusYears(1)).build();

        List<InvoiceItem> savedItems = new ArrayList<>();

        when(invoiceRepository.findByExamination(exam)).thenReturn(Optional.empty());
        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice i = inv.getArgument(0);
            if (i.getId() == null) i.setId(300L);
            return i;
        });
        when(invoiceItemRepository.save(any(InvoiceItem.class))).thenAnswer(inv -> {
            InvoiceItem item = inv.getArgument(0);
            item.setId((long) (savedItems.size() + 1));
            savedItems.add(item);
            return item;
        });
        when(invoiceItemRepository.findByInvoiceAndItemType(any(Invoice.class), any(String.class))).thenAnswer(inv -> {
            String type = inv.getArgument(1);
            return savedItems.stream().filter(it -> type.equals(it.getItemType())).toList();
        });
        when(invoiceItemRepository.findByInvoice(any(Invoice.class))).thenReturn(savedItems);

        when(labOrderRepository.findByExamination(exam)).thenReturn(List.of(labOrder));
        when(prescriptionRepository.findByExamination(exam)).thenReturn(List.of(presc));
        when(prescriptionItemRepository.findByPrescription(presc)).thenReturn(List.of(prescItem));
        when(drugInventoryRepository.findByMedication(para)).thenReturn(List.of(lot));

        InvoiceResponse response = billingService.syncExaminationInvoice(exam);

        // 150,000 (khám) + 180,000 (X-quang) + 10 * 2,000 (thuốc) = 350,000
        assertThat(response.getConsultationFee()).isEqualTo(150000.0);
        assertThat(response.getLabFee()).isEqualTo(180000.0);
        assertThat(response.getMedicationFee()).isEqualTo(20000.0);
        assertThat(response.getTotalAmount()).isEqualTo(350000.0);
        assertThat(response.getItems()).hasSize(3);
    }

    @Test
    @DisplayName("4. Áp dụng giảm trừ BHYT 80% tính đúng số tiền bệnh nhân đồng chi trả")
    void testApplyDiscount_Bhyt80Percent() {
        Invoice invoice = Invoice.builder()
                .id(400L)
                .invoiceNumber("INV-20261107-00002")
                .patient(patient)
                .consultationFee(150000.0)
                .labFee(150000.0)
                .medicationFee(200000.0)
                .discountAmount(0.0)
                .totalAmount(500000.0)
                .paidAmount(0.0)
                .status(InvoiceStatus.UNPAID)
                .build();

        when(invoiceRepository.findById(400L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));
        when(invoiceItemRepository.findByInvoice(eq(invoice))).thenReturn(Collections.emptyList());

        DiscountRequest discountReq = DiscountRequest.builder()
                .discountPercent(80.0)
                .bhytCode("DN4791234567890")
                .build();

        InvoiceResponse res = billingService.applyDiscount(400L, discountReq);

        assertThat(res.getDiscountAmount()).isEqualTo(400000.0);
        assertThat(res.getTotalAmount()).isEqualTo(100000.0);
        assertThat(res.getRemainingAmount()).isEqualTo(100000.0);
    }

    @Test
    @DisplayName("5. Bảo mật thanh toán: Chặn số tiền âm/0 và chặn bệnh nhân thanh toán hóa đơn của người khác")
    void testProcessPayment_BlocksNegativeAmountAndOtherPatient() {
        Invoice invoice = Invoice.builder()
                .id(500L)
                .invoiceNumber("INV-20261107-00005")
                .patient(patient)
                .totalAmount(150000.0)
                .paidAmount(0.0)
                .status(InvoiceStatus.UNPAID)
                .build();

        PaymentRequest negativeReq = PaymentRequest.builder().amount(-50000.0).build();
        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> billingService.processPayment(500L, negativeReq, "patient1")
        ).isInstanceOf(com.hospital.exception.BadRequestException.class);

        User otherUser = User.builder().id(99L).username("patient2").role(com.hospital.entity.enums.Role.PATIENT).build();
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(invoice));
        when(userRepository.findByUsername("patient2")).thenReturn(Optional.of(otherUser));

        PaymentRequest validReq = PaymentRequest.builder().amount(150000.0).build();
        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> billingService.processPayment(500L, validReq, "patient2")
        ).isInstanceOf(com.hospital.exception.BadRequestException.class)
         .hasMessageContaining("không có quyền thanh toán");
    }
}
