package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.entity.enums.LabOrderStatus;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabOrderService {

    private final LabOrderRepository labOrderRepository;
    private final LabTestRepository labTestRepository;
    private final ExaminationRepository examinationRepository;
    private final LabResultRepository labResultRepository;
    private final UserRepository userRepository;
    private final QueueService queueService;
    private final BillingService billingService;

    @Transactional
    public LabOrderResponse createLabOrder(Long examId, Long labTestId, String notes) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        LabTest labTest = labTestRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("LabTest not found"));

        LabOrder order = LabOrder.builder()
                .examination(exam)
                .labTest(labTest)
                .notes(notes)
                .status(LabOrderStatus.ORDERED)
                .build();

        order = labOrderRepository.save(order);

        // Auto-sync lab test charge onto patient's Invoice
        billingService.syncExaminationInvoice(exam);

        return mapToResponse(order);
    }

    public List<LabOrderResponse> getOrdersByExamination(Long examId) {
        Examination exam = examinationRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        return labOrderRepository.findByExamination(exam).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LabOrderResponse> getOrdersByStatus(String status) {
        LabOrderStatus enumStatus = LabOrderStatus.valueOf(status.toUpperCase());
        return labOrderRepository.findByStatus(enumStatus).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LabOrderResponse> getAllOrders() {
        return labOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabOrderResponse startProcessing(Long orderId, String labUsername) {
        LabOrder order = labOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(LabOrderStatus.IN_PROGRESS);
        order = labOrderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public LabOrderResponse submitResult(Long orderId, LabResultRequest req) {
        LabOrder order = labOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(LabOrderStatus.COMPLETED);
        labOrderRepository.save(order);

        LabResult result = labResultRepository.findByLabOrder(order)
                .orElseGet(() -> LabResult.builder().labOrder(order).build());

        result.setResultValue(req.getResultValue());
        result.setResultText(req.getResultText());
        result.setAbnormal(req.isAbnormal());
        result.setNotes(req.getNotes());
        if (req.getAttachmentUrl() != null && !req.getAttachmentUrl().isBlank()) {
            result.setAttachmentUrl(req.getAttachmentUrl().trim());
        }
        result.setVerifiedAt(LocalDateTime.now());
        labResultRepository.save(result);

        if (order.getExamination() != null) {
            List<LabOrder> allOrders = labOrderRepository.findByExamination(order.getExamination());
            boolean allCompleted = allOrders.stream().allMatch(o -> o.getStatus() == LabOrderStatus.COMPLETED);
            if (allCompleted && order.getExamination().getQueueTicket() != null) {
                try {
                    queueService.requeueAfterLabResults(order.getExamination().getId());
                } catch (Exception ignored) {
                    // Ignore if ticket cannot be re-queued
                }
            }
        }

        return mapToResponse(order);
    }

    public List<LabOrderResponse> getLabOrdersForDoctor(String doctorUsername) {
        return labOrderRepository.findByExaminationDoctorUserUsernameAndStatus(doctorUsername, LabOrderStatus.COMPLETED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<LabOrderResponse> getMyLabOrders(String patientUsername) {
        return labOrderRepository.findByExaminationPatientUserUsernameOrderByOrderedAtDesc(patientUsername)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private LabOrderResponse mapToResponse(LabOrder order) {
        String resultStr = null;
        String resultValue = null;
        String resultText = null;
        Boolean isAbnormal = false;
        String attachmentUrl = null;
        LocalDateTime verifiedAt = null;
        String notes = order.getNotes();

        if (order.getStatus() == LabOrderStatus.COMPLETED) {
            LabResult res = labResultRepository.findByLabOrder(order).orElse(null);
            if (res != null) {
                resultValue = res.getResultValue();
                resultText = res.getResultText();
                isAbnormal = res.isAbnormal();
                attachmentUrl = res.getAttachmentUrl();
                verifiedAt = res.getVerifiedAt();
                if (res.getNotes() != null && !res.getNotes().isBlank()) {
                    notes = res.getNotes();
                }
                if (resultText != null && !resultText.isBlank()) {
                    resultStr = (resultValue != null ? resultValue + " — " : "") + resultText;
                } else {
                    resultStr = resultValue;
                }
            }
        }

        Patient patient = order.getExamination() != null ? order.getExamination().getPatient() : null;
        String patientName = (patient != null && patient.getUser() != null)
                ? patient.getUser().getFullName() : "Bệnh nhân";
        String patientCode = patient != null ? patient.getPatientCode() : null;
        String doctorName = (order.getExamination() != null && order.getExamination().getDoctor() != null && order.getExamination().getDoctor().getUser() != null)
                ? order.getExamination().getDoctor().getUser().getFullName() : "Bác sĩ";

        LabTest test = order.getLabTest();

        return LabOrderResponse.builder()
                .id(order.getId())
                .testName(test != null ? test.getName() : "Xét nghiệm")
                .testCode(test != null ? test.getCode() : "XN")
                .category(test != null ? test.getCategory() : "OTHER")
                .price(test != null ? test.getPrice() : null)
                .unit(test != null ? test.getUnit() : null)
                .normalRange(test != null ? test.getNormalRange() : null)
                .patientName(patientName)
                .patientCode(patientCode)
                .doctorName(doctorName)
                .status(order.getStatus().name())
                .orderedAt(order.getOrderedAt())
                .verifiedAt(verifiedAt)
                .result(resultStr)
                .resultValue(resultValue)
                .resultText(resultText)
                .isAbnormal(isAbnormal)
                .notes(notes)
                .attachmentUrl(attachmentUrl)
                .build();
    }
}
