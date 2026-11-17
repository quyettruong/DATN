package com.hospital.service;

import com.hospital.dto.DiscountRequest;
import com.hospital.dto.InvoiceItemResponse;
import com.hospital.dto.InvoiceRequest;
import com.hospital.dto.InvoiceResponse;
import com.hospital.dto.PaymentRequest;
import com.hospital.entity.*;
import com.hospital.entity.enums.InvoiceStatus;
import com.hospital.entity.enums.LabOrderStatus;
import com.hospital.entity.enums.PaymentMethod;
import com.hospital.entity.enums.Role;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ExaminationRepository examinationRepository;
    private final UserRepository userRepository;
    private final LabOrderRepository labOrderRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final DrugInventoryRepository drugInventoryRepository;

    @Transactional
    public InvoiceResponse createInvoice(Long patientId, Long appointmentId, Long examinationId) {
        Examination examination = null;
        if (examinationId != null) {
            examination = examinationRepository.findById(examinationId).orElse(null);
            if (examination != null) {
                return syncExaminationInvoice(examination);
            }
        }

        Appointment appointment = null;
        if (appointmentId != null) {
            appointment = appointmentRepository.findById(appointmentId).orElse(null);
            if (appointment != null) {
                Optional<Invoice> existingByApp = invoiceRepository.findByAppointment(appointment);
                if (existingByApp.isPresent()) {
                    return mapToResponse(existingByApp.get());
                }
            }
        }

        Patient patient = resolvePatient(patientId, null, examination, appointment);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .patient(patient)
                .appointment(appointment)
                .examination(examination)
                .consultationFee(150000.0)
                .labFee(0.0)
                .medicationFee(0.0)
                .discountAmount(0.0)
                .totalAmount(150000.0)
                .paidAmount(0.0)
                .status(InvoiceStatus.UNPAID)
                .build();

        Invoice saved = invoiceRepository.save(invoice);

        InvoiceItem item = InvoiceItem.builder()
                .invoice(saved)
                .itemType("CONSULTATION")
                .itemName("Phí khám chuyên khoa")
                .quantity(1)
                .unitPrice(150000.0)
                .totalPrice(150000.0)
                .build();
        invoiceItemRepository.save(item);

        return mapToResponse(saved);
    }

    @Transactional
    public InvoiceResponse createManualInvoice(InvoiceRequest request) {
        if (request.getExaminationId() != null) {
            Examination exam = examinationRepository.findById(request.getExaminationId()).orElse(null);
            if (exam != null) {
                return syncExaminationInvoice(exam);
            }
        }
        if (request.getAppointmentId() != null && request.getLabFee() == null && request.getMedicationFee() == null) {
            return createInvoice(request.getPatientId(), request.getAppointmentId(), request.getExaminationId());
        }

        Appointment appointment = request.getAppointmentId() != null
                ? appointmentRepository.findById(request.getAppointmentId()).orElse(null)
                : null;
        Patient patient = resolvePatient(request.getPatientId(), request.getPatientCode(), null, appointment);

        double consult = request.getConsultationFee() != null ? request.getConsultationFee() : 150000.0;
        double lab = request.getLabFee() != null ? request.getLabFee() : 0.0;
        double med = request.getMedicationFee() != null ? request.getMedicationFee() : 0.0;
        double discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : 0.0;
        double total = Math.max(0.0, consult + lab + med - discount);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .patient(patient)
                .appointment(appointment)
                .consultationFee(consult)
                .labFee(lab)
                .medicationFee(med)
                .discountAmount(discount)
                .totalAmount(total)
                .paidAmount(0.0)
                .status(InvoiceStatus.UNPAID)
                .notes(request.getNotes())
                .build();

        Invoice saved = invoiceRepository.save(invoice);

        if (consult > 0) {
            invoiceItemRepository.save(InvoiceItem.builder()
                    .invoice(saved)
                    .itemType("CONSULTATION")
                    .itemName("Phí khám chuyên khoa")
                    .quantity(1)
                    .unitPrice(consult)
                    .totalPrice(consult)
                    .build());
        }
        if (lab > 0) {
            invoiceItemRepository.save(InvoiceItem.builder()
                    .invoice(saved)
                    .itemType("LAB_TEST")
                    .itemName("Chi phí xét nghiệm cận lâm sàng")
                    .quantity(1)
                    .unitPrice(lab)
                    .totalPrice(lab)
                    .build());
        }
        if (med > 0) {
            invoiceItemRepository.save(InvoiceItem.builder()
                    .invoice(saved)
                    .itemType("MEDICATION")
                    .itemName("Chi phí thuốc theo đơn")
                    .quantity(1)
                    .unitPrice(med)
                    .totalPrice(med)
                    .build());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public InvoiceResponse syncExaminationInvoiceById(Long examId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Examination not found"));
        return syncExaminationInvoice(exam);
    }

    @Transactional
    public InvoiceResponse syncExaminationInvoice(Examination exam) {
        if (exam == null) {
            throw new RuntimeException("Examination must not be null");
        }

        Appointment appointment = (exam.getQueueTicket() != null && exam.getQueueTicket().getCheckIn() != null)
                ? exam.getQueueTicket().getCheckIn().getAppointment()
                : null;

        Invoice invoice = invoiceRepository.findByExamination(exam).orElse(null);
        if (invoice == null && appointment != null) {
            invoice = invoiceRepository.findByAppointment(appointment).orElse(null);
            if (invoice != null && invoice.getExamination() == null) {
                invoice.setExamination(exam);
            }
        }

        if (invoice == null) {
            Patient patient = resolvePatient(
                    exam.getPatient() != null ? exam.getPatient().getId() : null,
                    null,
                    exam,
                    appointment
            );
            invoice = Invoice.builder()
                    .invoiceNumber(generateInvoiceNumber())
                    .patient(patient)
                    .appointment(appointment)
                    .examination(exam)
                    .consultationFee(150000.0)
                    .labFee(0.0)
                    .medicationFee(0.0)
                    .discountAmount(0.0)
                    .totalAmount(150000.0)
                    .paidAmount(0.0)
                    .status(InvoiceStatus.UNPAID)
                    .build();
            invoice = invoiceRepository.save(invoice);
        }

        // 1. Ensure Consultation InvoiceItem exists
        List<InvoiceItem> consultItems = invoiceItemRepository.findByInvoiceAndItemType(invoice, "CONSULTATION");
        if (consultItems.isEmpty() && invoice.getConsultationFee() != null && invoice.getConsultationFee() > 0) {
            invoiceItemRepository.save(InvoiceItem.builder()
                    .invoice(invoice)
                    .itemType("CONSULTATION")
                    .itemName("Phí khám chuyên khoa")
                    .quantity(1)
                    .unitPrice(invoice.getConsultationFee())
                    .totalPrice(invoice.getConsultationFee())
                    .build());
        }

        // 2. Sync Lab Orders -> LAB_TEST InvoiceItems
        List<LabOrder> activeLabOrders = labOrderRepository.findByExamination(exam).stream()
                .filter(o -> o.getStatus() != LabOrderStatus.CANCELLED)
                .collect(Collectors.toList());
        Set<Long> activeLabOrderIds = activeLabOrders.stream()
                .map(LabOrder::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<InvoiceItem> existingLabItems = new ArrayList<>(
                invoiceItemRepository.findByInvoiceAndItemType(invoice, "LAB_TEST")
        );
        Set<Long> syncedLabIds = new HashSet<>();
        for (InvoiceItem item : existingLabItems) {
            if (item.getReferenceId() != null && !activeLabOrderIds.contains(item.getReferenceId())) {
                invoiceItemRepository.delete(item);
            } else if (item.getReferenceId() != null) {
                syncedLabIds.add(item.getReferenceId());
            }
        }

        for (LabOrder order : activeLabOrders) {
            if (order.getId() != null && !syncedLabIds.contains(order.getId())) {
                double price = (order.getLabTest() != null && order.getLabTest().getPrice() != null && order.getLabTest().getPrice() > 0)
                        ? order.getLabTest().getPrice()
                        : 100000.0;
                String testName = order.getLabTest() != null ? order.getLabTest().getName() : "Xét nghiệm cận lâm sàng";
                invoiceItemRepository.save(InvoiceItem.builder()
                        .invoice(invoice)
                        .itemType("LAB_TEST")
                        .itemName("Xét nghiệm: " + testName)
                        .quantity(1)
                        .unitPrice(price)
                        .totalPrice(price)
                        .referenceId(order.getId())
                        .build());
            }
        }

        // 3. Sync Prescriptions -> MEDICATION InvoiceItems
        List<Prescription> activePrescriptions = prescriptionRepository.findByExamination(exam).stream()
                .filter(p -> !"CANCELLED".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());
        List<PrescriptionItem> activePrescItems = new ArrayList<>();
        for (Prescription p : activePrescriptions) {
            activePrescItems.addAll(prescriptionItemRepository.findByPrescription(p));
        }

        Map<Long, PrescriptionItem> activePrescMap = activePrescItems.stream()
                .filter(pi -> pi.getId() != null)
                .collect(Collectors.toMap(PrescriptionItem::getId, pi -> pi, (a, b) -> b));

        List<InvoiceItem> existingMedItems = new ArrayList<>(
                invoiceItemRepository.findByInvoiceAndItemType(invoice, "MEDICATION")
        );
        Set<Long> syncedMedIds = new HashSet<>();
        for (InvoiceItem item : existingMedItems) {
            PrescriptionItem matched = item.getReferenceId() != null ? activePrescMap.get(item.getReferenceId()) : null;
            if (item.getReferenceId() != null && (matched == null || !Objects.equals(item.getQuantity(), Math.max(1, matched.getQuantity())))) {
                invoiceItemRepository.delete(item);
            } else if (item.getReferenceId() != null) {
                syncedMedIds.add(item.getReferenceId());
            }
        }

        for (PrescriptionItem pi : activePrescItems) {
            if (pi.getId() != null && !syncedMedIds.contains(pi.getId())) {
                int qty = Math.max(1, pi.getQuantity());
                double unitPrice = resolveMedicationUnitPrice(pi.getMedication());
                double totalPrice = qty * unitPrice;
                String medName = pi.getMedication() != null ? pi.getMedication().getName() : "Dược phẩm";
                invoiceItemRepository.save(InvoiceItem.builder()
                        .invoice(invoice)
                        .itemType("MEDICATION")
                        .itemName("Thuốc: " + medName)
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .totalPrice(totalPrice)
                        .referenceId(pi.getId())
                        .build());
            }
        }

        // 4. Recompute subtotals from InvoiceItems
        double newLabFee = invoiceItemRepository.findByInvoiceAndItemType(invoice, "LAB_TEST").stream()
                .mapToDouble(i -> i.getTotalPrice() != null ? i.getTotalPrice() : 0.0)
                .sum();
        double newMedFee = invoiceItemRepository.findByInvoiceAndItemType(invoice, "MEDICATION").stream()
                .mapToDouble(i -> i.getTotalPrice() != null ? i.getTotalPrice() : 0.0)
                .sum();

        invoice.setLabFee(newLabFee);
        invoice.setMedicationFee(newMedFee);
        recalculateInvoice(invoice);
        invoice = invoiceRepository.save(invoice);

        return mapToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse applyDiscount(Long invoiceId, DiscountRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        double consult = invoice.getConsultationFee() != null ? invoice.getConsultationFee() : 0.0;
        double lab = invoice.getLabFee() != null ? invoice.getLabFee() : 0.0;
        double med = invoice.getMedicationFee() != null ? invoice.getMedicationFee() : 0.0;
        double gross = consult + lab + med;

        double discount = 0.0;
        if (request.getDiscountPercent() != null && request.getDiscountPercent() >= 0) {
            double pct = Math.min(100.0, request.getDiscountPercent());
            discount = Math.round((gross * pct) / 100.0);
        } else if (request.getDiscountAmount() != null) {
            discount = Math.max(0.0, request.getDiscountAmount());
        }
        discount = Math.min(gross, discount);

        invoice.setDiscountAmount(discount);
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            invoice.setNotes(request.getNotes().trim());
        } else if (request.getBhytCode() != null && !request.getBhytCode().isBlank()) {
            invoice.setNotes("Áp dụng BHYT: " + request.getBhytCode().trim());
        }

        recalculateInvoice(invoice);
        Invoice saved = invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    private double resolveMedicationUnitPrice(Medication medication) {
        if (medication == null) return 5000.0;
        List<DrugInventory> lots = drugInventoryRepository.findByMedication(medication);
        if (lots == null || lots.isEmpty()) return 5000.0;
        return lots.stream()
                .filter(inv -> inv.getSellingPrice() != null && inv.getSellingPrice() > 0)
                .map(DrugInventory::getSellingPrice)
                .findFirst()
                .orElse(5000.0);
    }

    private Patient resolvePatient(Long patientId, String patientCode, Examination examination, Appointment appointment) {
        Patient patient = null;
        if (patientId != null) {
            patient = patientRepository.findById(patientId).orElse(null);
        }
        if (patient == null && patientCode != null && !patientCode.isBlank()) {
            patient = patientRepository.findByPatientCode(patientCode.trim()).orElse(null);
        }
        if (patient == null && examination != null) {
            patient = examination.getPatient();
        }
        if (patient == null && appointment != null) {
            patient = appointment.getPatient();
        }
        if (patient == null) {
            throw new ResourceNotFoundException("Không tìm thấy hồ sơ bệnh nhân phù hợp để lập hóa đơn");
        }
        return patient;
    }

    @Transactional
    public void addLabFeeToInvoice(Long invoiceId, Long labOrderId, String testName, Double price) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        InvoiceItem item = InvoiceItem.builder()
                .invoice(invoice)
                .itemType("LAB_TEST")
                .itemName(testName)
                .quantity(1)
                .unitPrice(price)
                .totalPrice(price)
                .referenceId(labOrderId)
                .build();

        invoiceItemRepository.save(item);

        invoice.setLabFee((invoice.getLabFee() != null ? invoice.getLabFee() : 0.0) + price);
        recalculateInvoice(invoice);
        invoiceRepository.save(invoice);
    }

    @Transactional
    public void addMedicationFeeToInvoice(Long invoiceId, Long prescriptionItemId, String medName, Integer qty, Double unitPrice) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Double total = qty * unitPrice;
        InvoiceItem item = InvoiceItem.builder()
                .invoice(invoice)
                .itemType("MEDICATION")
                .itemName(medName)
                .quantity(qty)
                .unitPrice(unitPrice)
                .totalPrice(total)
                .referenceId(prescriptionItemId)
                .build();

        invoiceItemRepository.save(item);

        invoice.setMedicationFee((invoice.getMedicationFee() != null ? invoice.getMedicationFee() : 0.0) + total);
        recalculateInvoice(invoice);
        invoiceRepository.save(invoice);
    }

    @Transactional
    public InvoiceResponse processPayment(Long invoiceId, PaymentRequest request) {
        return processPayment(invoiceId, request, null);
    }

    @Transactional
    public InvoiceResponse processPayment(Long invoiceId, PaymentRequest request, String actorUsername) {
        if (request == null || request.getAmount() == null || request.getAmount() <= 0) {
            throw new BadRequestException("Số tiền thanh toán phải lớn hơn 0");
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn"));

        boolean isPatientCaller = false;
        if (actorUsername != null) {
            User caller = userRepository.findByUsername(actorUsername).orElse(null);
            if (caller != null && caller.getRole() == Role.PATIENT) {
                isPatientCaller = true;
                if (invoice.getPatient() == null
                        || invoice.getPatient().getUser() == null
                        || !caller.getId().equals(invoice.getPatient().getUser().getId())) {
                    throw new BadRequestException("Bạn không có quyền thanh toán hóa đơn của người bệnh khác");
                }
            }
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Hóa đơn này đã được thanh toán đầy đủ trước đó");
        }

        double total = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0.0;
        double paid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        double remaining = total - paid;
        if (request.getAmount() > remaining + 0.01) {
            throw new BadRequestException("Số tiền thanh toán vượt quá số tiền còn lại cần thu");
        }

        invoice.setPaidAmount(paid + request.getAmount());
        if (invoice.getPaidAmount() >= total) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoice.setPaidAt(LocalDateTime.now());
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
        }

        if (isPatientCaller) {
            invoice.setPaymentMethod(PaymentMethod.TRANSFER);
        } else if (request.getPaymentMethod() != null) {
            invoice.setPaymentMethod(request.getPaymentMethod());
        }

        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            invoice.setNotes(request.getNotes().trim());
        }

        return mapToResponse(invoiceRepository.save(invoice));
    }

    public List<InvoiceResponse> getInvoicesByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return invoiceRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getMyInvoices(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(user).orElse(null);
        if (patient == null) {
            return List.of();
        }
        return invoiceRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getUnpaidInvoices() {
        return invoiceRepository.findByStatus(InvoiceStatus.UNPAID)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public InvoiceResponse getInvoiceByAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        Invoice invoice = invoiceRepository.findByAppointment(appointment)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return mapToResponse(invoice);
    }

    public InvoiceResponse getInvoiceById(Long invoiceId) {
        return mapToResponse(invoiceRepository.findById(invoiceId).orElseThrow(() -> new RuntimeException("Invoice not found")));
    }

    @Transactional
    public void recalculateInvoice(Invoice invoice) {
        double consult = invoice.getConsultationFee() != null ? invoice.getConsultationFee() : 0.0;
        double lab = invoice.getLabFee() != null ? invoice.getLabFee() : 0.0;
        double med = invoice.getMedicationFee() != null ? invoice.getMedicationFee() : 0.0;
        double discount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0;
        double total = Math.max(0.0, consult + lab + med - discount);
        invoice.setTotalAmount(total);

        if (invoice.getStatus() != InvoiceStatus.CANCELLED) {
            double paid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
            if (total == 0.0 && discount > 0) {
                invoice.setStatus(InvoiceStatus.PAID);
                if (invoice.getPaidAt() == null) invoice.setPaidAt(LocalDateTime.now());
            } else if (paid >= total && total > 0) {
                invoice.setStatus(InvoiceStatus.PAID);
                if (invoice.getPaidAt() == null) invoice.setPaidAt(LocalDateTime.now());
            } else if (paid > 0 && paid < total) {
                invoice.setStatus(InvoiceStatus.PARTIAL);
            } else {
                invoice.setStatus(InvoiceStatus.UNPAID);
            }
        }
    }

    public Map<String, Double> getDailyRevenue(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        List<Invoice> invoices = invoiceRepository.findByStatusAndCreatedAtBetween(InvoiceStatus.PAID, start, end);

        double total = invoices.stream().mapToDouble(i -> i.getPaidAmount() != null ? i.getPaidAmount() : 0.0).sum();
        Map<String, Double> result = new HashMap<>();
        result.put("totalRevenue", total);
        return result;
    }

    private String generateInvoiceNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);

        String lastInvoiceNumber = invoiceRepository.findTopByCreatedAtBetweenOrderByInvoiceNumberDesc(start, end)
                .map(Invoice::getInvoiceNumber)
                .orElse(null);

        int seq = 1;
        if (lastInvoiceNumber != null && lastInvoiceNumber.startsWith("INV-" + dateStr + "-")) {
            try {
                String seqStr = lastInvoiceNumber.substring(lastInvoiceNumber.lastIndexOf("-") + 1);
                seq = Integer.parseInt(seqStr) + 1;
            } catch (Exception e) {
                // Ignore and use 1
            }
        }

        return String.format("INV-%s-%05d", dateStr, seq);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse res = new InvoiceResponse();
        res.setId(invoice.getId());
        res.setInvoiceNumber(invoice.getInvoiceNumber());
        if (invoice.getPatient() != null) {
            res.setPatientName(invoice.getPatient().getUser() != null ? invoice.getPatient().getUser().getFullName() : "Unknown");
            res.setPatientCode(invoice.getPatient().getPatientCode());
            res.setPatientId(invoice.getPatient().getId());
        }
        if (invoice.getAppointment() != null) {
            res.setAppointmentId(invoice.getAppointment().getId());
        }
        if (invoice.getExamination() != null) {
            res.setExaminationId(invoice.getExamination().getId());
        }
        res.setConsultationFee(invoice.getConsultationFee());
        res.setLabFee(invoice.getLabFee());
        res.setMedicationFee(invoice.getMedicationFee());
        res.setDiscountAmount(invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0);
        double total = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0.0;
        double paid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        res.setTotalAmount(total);
        res.setPaidAmount(paid);
        res.setRemainingAmount(Math.max(0.0, total - paid));
        res.setStatus(invoice.getStatus());
        res.setPaymentMethod(invoice.getPaymentMethod());
        res.setPaidAt(invoice.getPaidAt());
        res.setCreatedAt(invoice.getCreatedAt());
        res.setNotes(invoice.getNotes());

        if (invoice.getId() != null) {
            List<InvoiceItem> rawItems = invoiceItemRepository.findByInvoice(invoice);
            if (rawItems != null) {
                List<InvoiceItemResponse> items = rawItems.stream().map(item -> {
                    InvoiceItemResponse itemRes = new InvoiceItemResponse();
                    itemRes.setId(item.getId());
                    itemRes.setItemType(item.getItemType());
                    itemRes.setItemName(item.getItemName());
                    itemRes.setQuantity(item.getQuantity());
                    itemRes.setUnitPrice(item.getUnitPrice());
                    itemRes.setTotalPrice(item.getTotalPrice());
                    return itemRes;
                }).collect(Collectors.toList());
                res.setItems(items);
            }
        }

        return res;
    }
}
