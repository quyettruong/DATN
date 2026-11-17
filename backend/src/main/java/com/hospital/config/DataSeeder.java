package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.entity.enums.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedDrugInteractions();
        updateExistingPatientAllergies();
        updateExistingDrugInventoryExpiries();
        updateExistingLabTestPrices();
        if (userRepository.count() > 0) {
            ensureSpecialtyDoctorsExist();
            seedSampleQueueAndPrescription();
            return;
        }

        String encodedPassword = passwordEncoder.encode("123456");

        // Seed Users
        User admin = createUser("admin", encodedPassword, "Admin User", Role.ADMIN, "admin@hospital.local", "0900000000");
        
        User dr1User = createUser("doctor1", encodedPassword, "BS. Nguyễn Văn An", Role.DOCTOR, "doctor1@hospital.local", "0910000001");
        User dr2User = createUser("doctor2", encodedPassword, "BS. Trần Thị Bình", Role.DOCTOR, "doctor2@hospital.local", "0910000002");
        User dr3User = createUser("doctor3", encodedPassword, "BS. Lê Hoàng Cường", Role.DOCTOR, "doctor3@hospital.local", "0910000003");
        User dr4User = createUser("doctor4", encodedPassword, "BS. Phạm Minh Đức", Role.DOCTOR, "doctor4@hospital.local", "0910000004");
        User dr5User = createUser("doctor5", encodedPassword, "BS. Võ Minh Khôi", Role.DOCTOR, "doctor5@hospital.local", "0910000005");
        User dr6User = createUser("doctor6", encodedPassword, "BS. Đặng Thu Thảo", Role.DOCTOR, "doctor6@hospital.local", "0910000006");

        User staff1 = createUser("staff1", encodedPassword, "Ngô Thị Hà", Role.STAFF, "staff1@hospital.local", "0920000001");
        User staff2 = createUser("staff2", encodedPassword, "Đỗ Văn Phong", Role.STAFF, "staff2@hospital.local", "0920000002");

        User lab1 = createUser("lab1", encodedPassword, "Vũ Thị Lan", Role.LAB_TECHNICIAN, "lab1@hospital.local", "0930000001");
        User lab2 = createUser("lab2", encodedPassword, "Hoàng Văn Sơn", Role.LAB_TECHNICIAN, "lab2@hospital.local", "0930000002");

        User p1User = createUser("patient1", encodedPassword, "Lê Thị Mai", Role.PATIENT, "patient1@hospital.local", "0940000001");
        User p2User = createUser("patient2", encodedPassword, "Trần Văn Hùng", Role.PATIENT, "patient2@hospital.local", "0940000002");
        User p3User = createUser("patient3", encodedPassword, "Nguyễn Thị Hoa", Role.PATIENT, "patient3@hospital.local", "0940000003");
        User p4User = createUser("patient4", encodedPassword, "Phạm Đức Anh", Role.PATIENT, "patient4@hospital.local", "0940000004");
        User p5User = createUser("patient5", encodedPassword, "Võ Thị Ngọc", Role.PATIENT, "patient5@hospital.local", "0940000005");
        User p6User = createUser("patient6", encodedPassword, "Đặng Minh Tuấn", Role.PATIENT, "patient6@hospital.local", "0940000006");
        User p7User = createUser("patient7", encodedPassword, "Bùi Thị Thanh", Role.PATIENT, "patient7@hospital.local", "0940000007");
        User p8User = createUser("patient8", encodedPassword, "Lý Văn Khoa", Role.PATIENT, "patient8@hospital.local", "0940000008");

        userRepository.saveAll(Arrays.asList(admin, dr1User, dr2User, dr3User, dr4User, dr5User, dr6User, staff1, staff2, lab1, lab2, p1User, p2User, p3User, p4User, p5User, p6User, p7User, p8User));

        // Seed Departments
        Department deptNoi = createDept("NOI", "Nội tổng quát", "Khoa khám và điều trị các bệnh nội khoa");
        Department deptNgoai = createDept("NGOAI", "Ngoại tổng quát", "Khoa khám và điều trị các bệnh ngoại khoa");
        Department deptTmh = createDept("TMH", "Tai Mũi Họng", "Khoa khám và điều trị tai mũi họng");
        Department deptRhm = createDept("RHM", "Răng Hàm Mặt", "Khoa khám và điều trị răng hàm mặt");
        Department deptMat = createDept("MAT", "Mắt", "Khoa khám và điều trị mắt");
        Department deptDa = createDept("DA", "Da liễu", "Khoa khám và điều trị da liễu");

        departmentRepository.saveAll(Arrays.asList(deptNoi, deptNgoai, deptTmh, deptRhm, deptMat, deptDa));

        // Seed Rooms
        Room r101 = createRoom(deptNoi, "R101");
        Room r102 = createRoom(deptNoi, "R102");
        Room r201 = createRoom(deptNgoai, "R201");
        Room r202 = createRoom(deptNgoai, "R202");
        Room r301 = createRoom(deptTmh, "R301");
        Room r302 = createRoom(deptTmh, "R302");
        Room r401 = createRoom(deptRhm, "R401");
        Room r402 = createRoom(deptRhm, "R402");
        Room r501 = createRoom(deptMat, "R501");
        Room r502 = createRoom(deptMat, "R502");
        Room r601 = createRoom(deptDa, "R601");
        Room r602 = createRoom(deptDa, "R602");

        roomRepository.saveAll(Arrays.asList(r101, r102, r201, r202, r301, r302, r401, r402, r501, r502, r601, r602));

        // Seed Doctors (full coverage across all 6 departments)
        Doctor dr1 = Doctor.builder().user(dr1User).department(deptNoi).licenseNo("LIC001").specialization("Nội tổng quát & Tim mạch").build();
        Doctor dr2 = Doctor.builder().user(dr2User).department(deptNgoai).licenseNo("LIC002").specialization("Ngoại tổng quát & Phẫu thuật").build();
        Doctor dr3 = Doctor.builder().user(dr3User).department(deptTmh).licenseNo("LIC003").specialization("Tai Mũi Họng").build();
        Doctor dr4 = Doctor.builder().user(dr4User).department(deptRhm).licenseNo("LIC004").specialization("Răng Hàm Mặt").build();
        Doctor dr5 = Doctor.builder().user(dr5User).department(deptMat).licenseNo("LIC005").specialization("Nhãn khoa & Khúc xạ").build();
        Doctor dr6 = Doctor.builder().user(dr6User).department(deptDa).licenseNo("LIC006").specialization("Da liễu & Thẩm mỹ nội khoa").build();

        doctorRepository.saveAll(Arrays.asList(dr1, dr2, dr3, dr4, dr5, dr6));

        // Seed Patients
        Patient p1 = createPatient(p1User, "BN000001", LocalDate.of(1990, 5, 15), "FEMALE", "Hà Nội", "Penicillin, Dị ứng hải sản", "Tiền sử viêm loét dạ dày tá tràng mạn tính", "O+");
        Patient p2 = createPatient(p2User, "BN000002", LocalDate.of(1985, 8, 22), "MALE", "TP.HCM", "Aspirin, Nhóm NSAID", "Tăng huyết áp vô căn, Hen phế quản", "A+");
        Patient p3 = createPatient(p3User, "BN000003", LocalDate.of(1975, 3, 10), "FEMALE", "Đà Nẵng", "Paracetamol", "Đái tháo đường Type 2", "B+");
        Patient p4 = createPatient(p4User, "BN000004", LocalDate.of(2000, 12, 1), "MALE", "Hà Nội", "Không ghi nhận dị ứng", "Chưa ghi nhận bệnh lý nền", "AB+");
        Patient p5 = createPatient(p5User, "BN000005", LocalDate.of(1995, 7, 18), "FEMALE", "Hải Phòng", "Không ghi nhận dị ứng", "Khỏe mạnh", "O+");
        Patient p6 = createPatient(p6User, "BN000006", LocalDate.of(1988, 11, 25), "MALE", "Cần Thơ", "Không ghi nhận dị ứng", "Khỏe mạnh", "A+");
        Patient p7 = createPatient(p7User, "BN000007", LocalDate.of(1970, 1, 30), "FEMALE", "Huế", "Không ghi nhận dị ứng", "Khỏe mạnh", "B+");
        Patient p8 = createPatient(p8User, "BN000008", LocalDate.of(1998, 9, 5), "MALE", "Nghệ An", "Không ghi nhận dị ứng", "Khỏe mạnh", "O+");

        patientRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8));

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate afterTomorrow = today.plusDays(2);
        LocalDate yesterday = today.minusDays(1);

        // Seed Schedules
        DoctorSchedule s1_0 = createSchedule(dr1, r101, today, LocalTime.of(8, 0), LocalTime.of(12, 0), 20);
        DoctorSchedule s1_1 = createSchedule(dr1, r101, tomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 20);
        DoctorSchedule s1_2 = createSchedule(dr1, r101, afterTomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 20);
        DoctorSchedule s1_past = createSchedule(dr1, r101, yesterday, LocalTime.of(8, 0), LocalTime.of(12, 0), 20);

        DoctorSchedule s2_0 = createSchedule(dr2, r201, today, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);
        DoctorSchedule s2_1 = createSchedule(dr2, r201, tomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);
        DoctorSchedule s2_2 = createSchedule(dr2, r201, afterTomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);
        DoctorSchedule s2_past = createSchedule(dr2, r201, yesterday, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);

        DoctorSchedule s3_0 = createSchedule(dr3, r301, today, LocalTime.of(13, 0), LocalTime.of(17, 0), 18);
        DoctorSchedule s3_1 = createSchedule(dr3, r301, tomorrow, LocalTime.of(13, 0), LocalTime.of(17, 0), 18);
        DoctorSchedule s3_2 = createSchedule(dr3, r301, afterTomorrow, LocalTime.of(13, 0), LocalTime.of(17, 0), 18);
        DoctorSchedule s3_past = createSchedule(dr3, r301, yesterday, LocalTime.of(13, 0), LocalTime.of(17, 0), 18);

        DoctorSchedule s4_0 = createSchedule(dr4, r401, today, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);
        DoctorSchedule s4_1 = createSchedule(dr4, r401, tomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);
        DoctorSchedule s4_2 = createSchedule(dr4, r401, afterTomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);
        DoctorSchedule s4_past = createSchedule(dr4, r401, yesterday, LocalTime.of(8, 0), LocalTime.of(12, 0), 15);

        DoctorSchedule s5_0 = createSchedule(dr5, r501, today, LocalTime.of(8, 0), LocalTime.of(12, 0), 18);
        DoctorSchedule s5_1 = createSchedule(dr5, r501, tomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 18);
        DoctorSchedule s5_2 = createSchedule(dr5, r501, afterTomorrow, LocalTime.of(8, 0), LocalTime.of(12, 0), 18);

        DoctorSchedule s6_0 = createSchedule(dr6, r601, today, LocalTime.of(13, 0), LocalTime.of(17, 0), 18);
        DoctorSchedule s6_1 = createSchedule(dr6, r601, tomorrow, LocalTime.of(13, 0), LocalTime.of(17, 0), 18);
        DoctorSchedule s6_2 = createSchedule(dr6, r601, afterTomorrow, LocalTime.of(13, 0), LocalTime.of(17, 0), 18);

        doctorScheduleRepository.saveAll(Arrays.asList(
                s1_0, s1_1, s1_2, s1_past,
                s2_0, s2_1, s2_2, s2_past,
                s3_0, s3_1, s3_2, s3_past,
                s4_0, s4_1, s4_2, s4_past,
                s5_0, s5_1, s5_2,
                s6_0, s6_1, s6_2
        ));

        // Seed Appointments
        List<Appointment> apps = Arrays.asList(
                // Patient 1
                createAppointment(p1, dr1, s1_0, today, LocalTime.of(8, 30), AppointmentStatus.CONFIRMED, "Khám tổng quát"),
                createAppointment(p1, dr2, s2_1, tomorrow, LocalTime.of(9, 0), AppointmentStatus.PENDING, "Đau dạ dày"),
                createAppointment(p1, dr3, s3_past, yesterday, LocalTime.of(14, 0), AppointmentStatus.COMPLETED, "Đau họng"),
                
                // Patient 2
                createAppointment(p2, dr2, s2_0, today, LocalTime.of(9, 30), AppointmentStatus.CONFIRMED, "Khám ngoại"),
                createAppointment(p2, dr4, s4_1, tomorrow, LocalTime.of(10, 0), AppointmentStatus.PENDING, "Nhổ răng"),
                
                // Patient 3
                createAppointment(p3, dr3, s3_0, today, LocalTime.of(13, 30), AppointmentStatus.CONFIRMED, "Viêm xoang"),
                createAppointment(p3, dr1, s1_1, tomorrow, LocalTime.of(8, 45), AppointmentStatus.PENDING, "Đau đầu"),
                createAppointment(p3, dr2, s2_past, yesterday, LocalTime.of(10, 30), AppointmentStatus.COMPLETED, "Cắt chỉ"),
                
                // Patient 4
                createAppointment(p4, dr4, s4_0, today, LocalTime.of(8, 15), AppointmentStatus.CONFIRMED, "Trám răng"),
                createAppointment(p4, dr3, s3_1, tomorrow, LocalTime.of(14, 30), AppointmentStatus.PENDING, "Ù tai"),
                
                // Patient 5
                createAppointment(p5, dr1, s1_0, today, LocalTime.of(10, 0), AppointmentStatus.CONFIRMED, "Mệt mỏi"),
                createAppointment(p5, dr4, s4_past, yesterday, LocalTime.of(11, 0), AppointmentStatus.COMPLETED, "Khám định kỳ")
        );
        appointmentRepository.saveAll(apps);
        
        seedLabTests();
        seedMedications();
        seedDrugInventory();
        seedInvoices();
        seedSampleQueueAndPrescription();
    }

    private User createUser(String username, String pass, String fullName, Role role, String email, String phone) {
        return User.builder()
                .username(username)
                .password(pass)
                .fullName(fullName)
                .role(role)
                .email(email)
                .phone(phone)
                .build();
    }

    private Department createDept(String code, String name, String desc) {
        return Department.builder().code(code).name(name).description(desc).build();
    }

    private Room createRoom(Department dept, String code) {
        return Room.builder().department(dept).code(code).name("Phòng " + code).type("EXAM").capacity(1).status("ACTIVE").build();
    }

    private Patient createPatient(User user, String code, LocalDate dob, String gender, String address, String allergies, String medicalHistory, String bloodType) {
        return Patient.builder()
                .user(user)
                .patientCode(code)
                .dob(dob)
                .gender(gender)
                .address(address)
                .allergies(allergies)
                .medicalHistory(medicalHistory)
                .bloodType(bloodType)
                .build();
    }

    private DoctorSchedule createSchedule(Doctor doc, Room room, LocalDate date, LocalTime start, LocalTime end, int max) {
        return DoctorSchedule.builder()
                .doctor(doc)
                .room(room)
                .date(date)
                .startTime(start)
                .endTime(end)
                .maxSlots(max)
                .bookedSlots(0)
                .build();
    }

    private Appointment createAppointment(Patient p, Doctor d, DoctorSchedule s, LocalDate date, LocalTime time, AppointmentStatus status, String reason) {
        s.setBookedSlots(s.getBookedSlots() + 1); // update booked slots
        return Appointment.builder()
                .patient(p)
                .doctor(d)
                .schedule(s)
                .appointmentDate(date)
                .startTime(time)
                .status(status)
                .reason(reason)
                .build();
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.LabTestRepository labTestRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.MedicationRepository medicationRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.DrugInventoryRepository drugInventoryRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.InvoiceRepository invoiceRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.DrugInteractionRepository drugInteractionRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.CheckInRepository checkInRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.QueueTicketRepository queueTicketRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.ExaminationRepository examinationRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.PrescriptionRepository prescriptionRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.hospital.repository.PrescriptionItemRepository prescriptionItemRepository;

    private void seedLabTests() {
        if (labTestRepository.count() == 0) {
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("CBC").name("Công thức máu (CBC)").category("BLOOD").price(120000.0).unit("G/L").normalRange("WBC 4.0-10.0, RBC 4.2-5.4").build());
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("GLU").name("Đường huyết (Glucose)").category("BLOOD").price(80000.0).unit("mmol/L").normalRange("3.9 - 6.4 mmol/L").build());
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("CHOL").name("Cholesterol toàn phần").category("BLOOD").price(95000.0).unit("mmol/L").normalRange("< 5.2 mmol/L").build());
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("CREA").name("Creatinine huyết thanh").category("BLOOD").price(85000.0).unit("µmol/L").normalRange("62 - 106 µmol/L").build());
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("GOT").name("Men gan AST/ALT (GOT/GPT)").category("BLOOD").price(110000.0).unit("U/L").normalRange("< 40 U/L").build());
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("URINE").name("Tổng phân tích nước tiểu").category("URINE").price(90000.0).unit("pH / SG").normalRange("Âm tính, pH 5.0-7.5").build());
            // [Tạm thời comment dịch vụ Chẩn đoán hình ảnh X-Quang / Siêu âm]
            // labTestRepository.save(com.hospital.entity.LabTest.builder().code("XRAY").name("X-quang ngực thẳng").category("IMAGING").price(180000.0).unit("Hình ảnh").normalRange("Tim phổi trong giới hạn bình thường").build());
            // labTestRepository.save(com.hospital.entity.LabTest.builder().code("US").name("Siêu âm ổ bụng tổng quát").category("IMAGING").price(220000.0).unit("Hình ảnh").normalRange("Gan mật tụy lách thận bình thường").build());
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("HBA1C").name("Định lượng HbA1c").category("BLOOD").price(150000.0).unit("%").normalRange("4.0 - 5.6 %").build());
            labTestRepository.save(com.hospital.entity.LabTest.builder().code("TSH").name("Hormone tuyến giáp TSH").category("BLOOD").price(180000.0).unit("mIU/L").normalRange("0.4 - 4.0 mIU/L").build());
        }
    }

    private void seedMedications() {
        if (medicationRepository.count() == 0) {
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M01").name("Paracetamol 500mg").genericName("Paracetamol").dosageForm("TABLET").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M02").name("Amoxicillin 500mg").genericName("Amoxicillin").dosageForm("CAPSULE").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M03").name("Omeprazole 20mg").genericName("Omeprazole").dosageForm("CAPSULE").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M04").name("Metformin 500mg").genericName("Metformin").dosageForm("TABLET").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M05").name("Amlodipine 5mg").genericName("Amlodipine").dosageForm("TABLET").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M06").name("Cetirizine 10mg").genericName("Cetirizine").dosageForm("TABLET").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M07").name("Ibuprofen 400mg").genericName("Ibuprofen").dosageForm("TABLET").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M08").name("Ciprofloxacin 500mg").genericName("Ciprofloxacin").dosageForm("TABLET").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M09").name("Dexamethasone").genericName("Dexamethasone").dosageForm("TABLET").build());
            medicationRepository.save(com.hospital.entity.Medication.builder().code("M10").name("Salbutamol").genericName("Salbutamol").dosageForm("INHALER").build());
        }
    }

    private void seedDrugInventory() {
        if (drugInventoryRepository.count() > 0) return;
        List<Medication> meds = medicationRepository.findAll();
        for (Medication med : meds) {
            double price = 5000.0;
            if (med.getCode().equals("M01")) price = 2000.0;
            else if (med.getCode().equals("M03")) price = 8000.0;
            else if (med.getCode().equals("M04")) price = 3000.0;
            else if (med.getCode().equals("M05")) price = 6000.0;

            DrugInventory inv1 = DrugInventory.builder()
                .medication(med)
                .lotNumber("LOT1-" + med.getCode())
                .expiryDate(LocalDate.now().plusYears(1).plusMonths(6))
                .stockQuantity(200)
                .costPrice(price * 0.7)
                .sellingPrice(price)
                .reorderLevel(50)
                .build();
            DrugInventory inv2 = DrugInventory.builder()
                .medication(med)
                .lotNumber("LOT2-" + med.getCode())
                .expiryDate(LocalDate.now().plusYears(2).plusMonths(6))
                .stockQuantity(150)
                .costPrice(price * 0.7)
                .sellingPrice(price)
                .reorderLevel(50)
                .build();
            drugInventoryRepository.save(inv1);
            drugInventoryRepository.save(inv2);
        }
    }

    private void seedInvoices() {
        if (invoiceRepository.count() > 0) return;
        List<Appointment> apps = appointmentRepository.findAll();
        int count = 1;
        String datePrefix = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        for (Appointment app : apps) {
            if (app.getStatus() == AppointmentStatus.COMPLETED) {
                Invoice inv = Invoice.builder()
                    .invoiceNumber(String.format("INV-%s-%05d", datePrefix, count++))
                    .patient(app.getPatient())
                    .appointment(app)
                    .consultationFee(150000.0)
                    .labFee(0.0)
                    .medicationFee(0.0)
                    .totalAmount(150000.0)
                    .paidAmount(150000.0)
                    .status(com.hospital.entity.enums.InvoiceStatus.PAID)
                    .build();
                invoiceRepository.save(inv);
            } else if (app.getStatus() == AppointmentStatus.CONFIRMED && app.getAppointmentDate().equals(LocalDate.now())) {
                Invoice inv = Invoice.builder()
                    .invoiceNumber(String.format("INV-%s-%05d", datePrefix, count++))
                    .patient(app.getPatient())
                    .appointment(app)
                    .consultationFee(150000.0)
                    .labFee(0.0)
                    .medicationFee(0.0)
                    .totalAmount(150000.0)
                    .paidAmount(0.0)
                    .status(com.hospital.entity.enums.InvoiceStatus.UNPAID)
                    .build();
                invoiceRepository.save(inv);
            }
        }
    }

    private void seedDrugInteractions() {
        if (drugInteractionRepository.count() > 0) return;
        seedMedications(); // ensure medications exist

        Medication paracetamol = medicationRepository.findByCode("M01").orElse(null);
        Medication amoxicillin = medicationRepository.findByCode("M02").orElse(null);
        Medication omeprazole = medicationRepository.findByCode("M03").orElse(null);
        Medication metformin = medicationRepository.findByCode("M04").orElse(null);
        Medication amlodipine = medicationRepository.findByCode("M05").orElse(null);
        Medication cetirizine = medicationRepository.findByCode("M06").orElse(null);
        Medication ibuprofen = medicationRepository.findByCode("M07").orElse(null);
        Medication ciprofloxacin = medicationRepository.findByCode("M08").orElse(null);
        Medication dexamethasone = medicationRepository.findByCode("M09").orElse(null);
        Medication salbutamol = medicationRepository.findByCode("M10").orElse(null);

        if (ibuprofen != null && dexamethasone != null) {
            drugInteractionRepository.save(DrugInteraction.builder()
                    .medicationA(ibuprofen)
                    .medicationB(dexamethasone)
                    .severity("CRITICAL")
                    .title("Nguy cơ Loét & Xuất huyết Tiêu hóa Nặng (NSAID + Corticosteroid)")
                    .description("Sử dụng đồng thời Ibuprofen và Dexamethasone làm tăng đột biến nguy cơ loét đường tiêu hóa, xuất huyết tiêu hóa nghiêm trọng và thủng dạ dày.")
                    .clinicalAdvice("Hạn chế phối hợp. Nếu bắt buộc điều trị, chỉ định kèm thuốc ức chế bơm proton (Omeprazole) để bảo vệ niêm mạc dạ dày.")
                    .active(true)
                    .build());
        }

        if (ibuprofen != null && amlodipine != null) {
            drugInteractionRepository.save(DrugInteraction.builder()
                    .medicationA(ibuprofen)
                    .medicationB(amlodipine)
                    .severity("WARNING")
                    .title("Giảm tác dụng hạ huyết áp của Amlodipine")
                    .description("NSAID (Ibuprofen) ức chế tổng hợp prostaglandin tại thận, gây ứ trệ natri và nước, làm suy giảm hiệu quả điều trị tăng huyết áp của Amlodipine.")
                    .clinicalAdvice("Theo dõi huyết áp định kỳ của người bệnh và cân nhắc dùng Paracetamol để giảm đau thay thế.")
                    .active(true)
                    .build());
        }

        if (ciprofloxacin != null && dexamethasone != null) {
            drugInteractionRepository.save(DrugInteraction.builder()
                    .medicationA(ciprofloxacin)
                    .medicationB(dexamethasone)
                    .severity("CRITICAL")
                    .title("Nguy cơ Viêm đứt gân gót Achilles (Quinolone + Corticosteroid)")
                    .description("Phối hợp Quinolone (Ciprofloxacin) cùng Corticosteroid (Dexamethasone) làm tăng gấp nhiều lần nguy cơ viêm gân và đứt gân gót Achilles, đặc biệt ở người lớn tuổi.")
                    .clinicalAdvice("Tránh phối hợp trừ khi tuyệt đối cần thiết. Theo dõi sát triệu chứng đau nhức vùng gót chân của bệnh nhân.")
                    .active(true)
                    .build());
        }

        if (metformin != null && ciprofloxacin != null) {
            drugInteractionRepository.save(DrugInteraction.builder()
                    .medicationA(metformin)
                    .medicationB(ciprofloxacin)
                    .severity("WARNING")
                    .title("Rối loạn dao động nồng độ đường huyết ở bệnh nhân Đái tháo đường")
                    .description("Ciprofloxacin có thể làm xáo trộn đường huyết nghiêm trọng (hạ đường huyết quá mức hoặc tăng đường huyết) khi dùng chung với Metformin.")
                    .clinicalAdvice("Hướng dẫn người bệnh tự theo dõi sát chỉ số đường huyết mao mạch trong đợt điều trị kháng sinh.")
                    .active(true)
                    .build());
        }
    }

    private void updateExistingPatientAllergies() {
        List<Patient> patients = patientRepository.findAll();
        for (Patient p : patients) {
            boolean updated = false;
            if (p.getAllergies() == null || p.getAllergies().isEmpty()) {
                if ("BN000001".equals(p.getPatientCode())) {
                    p.setAllergies("Penicillin, Dị ứng hải sản");
                    p.setMedicalHistory("Tiền sử viêm loét dạ dày tá tràng mạn tính");
                    p.setBloodType("O+");
                    updated = true;
                } else if ("BN000002".equals(p.getPatientCode())) {
                    p.setAllergies("Aspirin, Nhóm NSAID");
                    p.setMedicalHistory("Tăng huyết áp vô căn, Hen phế quản");
                    p.setBloodType("A+");
                    updated = true;
                } else if ("BN000003".equals(p.getPatientCode())) {
                    p.setAllergies("Paracetamol");
                    p.setMedicalHistory("Đái tháo đường Type 2");
                    p.setBloodType("B+");
                    updated = true;
                } else {
                    p.setAllergies("Không ghi nhận dị ứng");
                    p.setMedicalHistory("Chưa ghi nhận bệnh lý đặc biệt");
                    p.setBloodType("O+");
                    updated = true;
                }
            }
            if (updated) {
                patientRepository.save(p);
            }
        }
    }

    private void updateExistingDrugInventoryExpiries() {
        List<DrugInventory> inventories = drugInventoryRepository.findAll();
        for (DrugInventory inv : inventories) {
            if (inv.getExpiryDate() != null && inv.getExpiryDate().isBefore(LocalDate.now())) {
                inv.setExpiryDate(LocalDate.now().plusYears(2));
                drugInventoryRepository.save(inv);
            }
        }
    }

    private void updateExistingLabTestPrices() {
        List<LabTest> tests = labTestRepository.findAll();
        for (LabTest test : tests) {
            boolean changed = false;
            if (test.getPrice() == null || test.getPrice() <= 0) {
                switch (test.getCode() != null ? test.getCode().toUpperCase() : "") {
                    case "CBC": test.setPrice(120000.0); test.setUnit("G/L"); test.setNormalRange("WBC 4.0-10.0, RBC 4.2-5.4"); break;
                    case "GLU": test.setPrice(80000.0); test.setUnit("mmol/L"); test.setNormalRange("3.9 - 6.4 mmol/L"); break;
                    case "CHOL": test.setPrice(95000.0); test.setUnit("mmol/L"); test.setNormalRange("< 5.2 mmol/L"); break;
                    case "CREA": test.setPrice(85000.0); test.setUnit("µmol/L"); test.setNormalRange("62 - 106 µmol/L"); break;
                    case "GOT": test.setPrice(110000.0); test.setUnit("U/L"); test.setNormalRange("< 40 U/L"); break;
                    case "URINE": test.setPrice(90000.0); test.setUnit("pH / SG"); test.setNormalRange("Âm tính, pH 5.0-7.5"); break;
                    // case "XRAY": test.setPrice(180000.0); test.setUnit("Hình ảnh"); test.setNormalRange("Tim phổi bình thường"); break;
                    // case "US": test.setPrice(220000.0); test.setUnit("Hình ảnh"); test.setNormalRange("Gan mật tụy lách thận bình thường"); break;
                    case "HBA1C": test.setPrice(150000.0); test.setUnit("%"); test.setNormalRange("4.0 - 5.6 %"); break;
                    case "TSH": test.setPrice(180000.0); test.setUnit("mIU/L"); test.setNormalRange("0.4 - 4.0 mIU/L"); break;
                    default: test.setPrice(100000.0); break;
                }
                changed = true;
            }
            if (changed) {
                labTestRepository.save(test);
            }
        }
    }

    private void ensureSpecialtyDoctorsExist() {
        String encodedPassword = passwordEncoder.encode("123456");
        List<Doctor> allDoctors = doctorRepository.findAll();

        // Đồng bộ tên chuyên môn tiếng Việt cho các bác sĩ mẫu cũ nếu còn tiếng Anh
        for (Doctor d : allDoctors) {
            if ("General Medicine".equals(d.getSpecialization())) {
                d.setSpecialization("Nội tổng quát & Tim mạch");
                doctorRepository.save(d);
            } else if ("General Surgery".equals(d.getSpecialization())) {
                d.setSpecialization("Ngoại tổng quát & Phẫu thuật");
                doctorRepository.save(d);
            } else if ("Otolaryngology".equals(d.getSpecialization())) {
                d.setSpecialization("Tai Mũi Họng");
                doctorRepository.save(d);
            } else if ("Odonto-Stomatology".equals(d.getSpecialization())) {
                d.setSpecialization("Răng Hàm Mặt");
                doctorRepository.save(d);
            }
        }

        departmentRepository.findByCode("MAT").ifPresent(deptMat -> {
            if (doctorRepository.findByDepartment(deptMat).isEmpty()) {
                User dr5User = userRepository.findByUsername("doctor5")
                        .orElseGet(() -> userRepository.save(createUser(
                                "doctor5", encodedPassword, "BS. Võ Minh Khôi",
                                Role.DOCTOR, "doctor5@hospital.local", "0910000005")));
                Doctor dr5 = doctorRepository.save(Doctor.builder()
                        .user(dr5User)
                        .department(deptMat)
                        .licenseNo("LIC005")
                        .specialization("Nhãn khoa & Khúc xạ")
                        .build());
                Room roomMat = roomRepository.findByDepartment(deptMat).stream().findFirst().orElse(null);
                if (roomMat != null) {
                    LocalDate today = LocalDate.now();
                    doctorScheduleRepository.saveAll(Arrays.asList(
                            createSchedule(dr5, roomMat, today, LocalTime.of(8, 0), LocalTime.of(12, 0), 18),
                            createSchedule(dr5, roomMat, today.plusDays(1), LocalTime.of(8, 0), LocalTime.of(12, 0), 18),
                            createSchedule(dr5, roomMat, today.plusDays(2), LocalTime.of(8, 0), LocalTime.of(12, 0), 18)
                    ));
                }
            }
        });

        departmentRepository.findByCode("DA").ifPresent(deptDa -> {
            if (doctorRepository.findByDepartment(deptDa).isEmpty()) {
                User dr6User = userRepository.findByUsername("doctor6")
                        .orElseGet(() -> userRepository.save(createUser(
                                "doctor6", encodedPassword, "BS. Đặng Thu Thảo",
                                Role.DOCTOR, "doctor6@hospital.local", "0910000006")));
                Doctor dr6 = doctorRepository.save(Doctor.builder()
                        .user(dr6User)
                        .department(deptDa)
                        .licenseNo("LIC006")
                        .specialization("Da liễu & Thẩm mỹ nội khoa")
                        .build());
                Room roomDa = roomRepository.findByDepartment(deptDa).stream().findFirst().orElse(null);
                if (roomDa != null) {
                    LocalDate today = LocalDate.now();
                    doctorScheduleRepository.saveAll(Arrays.asList(
                            createSchedule(dr6, roomDa, today, LocalTime.of(13, 0), LocalTime.of(17, 0), 18),
                            createSchedule(dr6, roomDa, today.plusDays(1), LocalTime.of(13, 0), LocalTime.of(17, 0), 18),
                            createSchedule(dr6, roomDa, today.plusDays(2), LocalTime.of(13, 0), LocalTime.of(17, 0), 18)
                    ));
                }
            }
        });
    }

    private void seedSampleQueueAndPrescription() {
        Patient p1 = patientRepository.findAll().stream()
                .filter(p -> "BN000001".equals(p.getPatientCode()))
                .findFirst().orElse(null);
        if (p1 == null) return;

        LocalDate today = LocalDate.now();

        // 1. Seed CheckIn and Live QueueTicket for today's appointment if missing
        List<Appointment> p1Appointments = appointmentRepository.findByPatientOrderByAppointmentDateDesc(p1);
        for (Appointment app : p1Appointments) {
            if (today.equals(app.getAppointmentDate()) && app.getStatus() == AppointmentStatus.CONFIRMED) {
                if (checkInRepository.findByAppointment(app).isEmpty()) {
                    CheckIn checkIn = checkInRepository.save(CheckIn.builder()
                            .appointment(app)
                            .checkedInAt(java.time.LocalDateTime.now().withHour(8).withMinute(15))
                            .status(CheckInStatus.CHECKED_IN)
                            .method("COUNTER")
                            .bloodPressureSystolic(120)
                            .bloodPressureDiastolic(80)
                            .heartRate(75)
                            .temperature(36.8)
                            .weight(52.0)
                            .height(160.0)
                            .spO2(98)
                            .triageLevel(com.hospital.entity.enums.TriageLevel.LEVEL_5_NON_URGENT)
                            .triagedAt(java.time.LocalDateTime.now().withHour(8).withMinute(20))
                            .triagedByUsername("staff1")
                            .build());

                    Room room = (app.getSchedule() != null && app.getSchedule().getRoom() != null)
                            ? app.getSchedule().getRoom()
                            : roomRepository.findAll().stream().findFirst().orElse(null);

                    Doctor doctor = app.getDoctor() != null
                            ? app.getDoctor()
                            : doctorRepository.findAll().stream().findFirst().orElse(null);

                    queueTicketRepository.save(QueueTicket.builder()
                            .checkIn(checkIn)
                            .room(room)
                            .doctor(doctor)
                            .queueDate(today)
                            .queueNumber("A001")
                            .status(QueueStatus.WAITING)
                            .priorityScore(10)
                            .estimatedWaitMinutes(10)
                            .triageLevel(com.hospital.entity.enums.TriageLevel.LEVEL_5_NON_URGENT)
                            .build());
                }
                break;
            }
        }

        // 2. Seed past completed check-in, examination & prescription for yesterday's appointment
        if (prescriptionRepository.findByPatientOrderByCreatedAtDesc(p1).isEmpty()) {
            Appointment pastApp = p1Appointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .findFirst().orElse(null);

            if (pastApp != null) {
                CheckIn pastCheckIn = checkInRepository.findByAppointment(pastApp).orElseGet(() ->
                        checkInRepository.save(CheckIn.builder()
                                .appointment(pastApp)
                                .checkedInAt(java.time.LocalDateTime.now().minusDays(1).withHour(13).withMinute(50))
                                .status(CheckInStatus.CHECKED_IN)
                                .method("COUNTER")
                                .bloodPressureSystolic(120)
                                .bloodPressureDiastolic(80)
                                .heartRate(76)
                                .temperature(37.8)
                                .weight(52.0)
                                .height(160.0)
                                .spO2(98)
                                .triageLevel(com.hospital.entity.enums.TriageLevel.LEVEL_5_NON_URGENT)
                                .build())
                );

                Room r301 = (pastApp.getSchedule() != null && pastApp.getSchedule().getRoom() != null)
                        ? pastApp.getSchedule().getRoom()
                        : roomRepository.findAll().stream().findFirst().orElse(null);

                QueueTicket pastTicket = queueTicketRepository.findAll().stream()
                        .filter(t -> t.getCheckIn() != null && t.getCheckIn().getId().equals(pastCheckIn.getId()))
                        .findFirst()
                        .orElseGet(() -> queueTicketRepository.save(QueueTicket.builder()
                                .checkIn(pastCheckIn)
                                .room(r301)
                                .doctor(pastApp.getDoctor())
                                .queueDate(today.minusDays(1))
                                .queueNumber("C001")
                                .status(QueueStatus.COMPLETED)
                                .calledAt(java.time.LocalDateTime.now().minusDays(1).withHour(14).withMinute(0))
                                .startedAt(java.time.LocalDateTime.now().minusDays(1).withHour(14).withMinute(5))
                                .completedAt(java.time.LocalDateTime.now().minusDays(1).withHour(14).withMinute(30))
                                .build()));

                Examination exam = examinationRepository.save(Examination.builder()
                        .queueTicket(pastTicket)
                        .doctor(pastApp.getDoctor())
                        .patient(p1)
                        .symptoms("Đau rát họng khi nuốt, ho khan từng cơn, sốt nhẹ 37.8°C")
                        .diagnosis("Viêm họng cấp tính do thời tiết (J02.9)")
                        .conclusion("Uống thuốc theo đơn đủ 5 ngày, súc họng nước muối sinh lý ấm, uống nhiều nước ấm. Tái khám sau 5 ngày nếu không thuyên giảm.")
                        .notes("Bệnh nhân có cơ địa dị ứng Penicillin - TUYỆT ĐỐI KHÔNG dùng Beta-lactam. Tiền sử đau dạ dày - kê kèm Omeprazole bảo vệ niêm mạc.")
                        .bloodPressure("120/80")
                        .heartRate(76)
                        .temperature(37.8)
                        .weight(52.0)
                        .height(160.0)
                        .startedAt(java.time.LocalDateTime.now().minusDays(1).withHour(14).withMinute(5))
                        .endedAt(java.time.LocalDateTime.now().minusDays(1).withHour(14).withMinute(25))
                        .build());

                Prescription prescription = prescriptionRepository.save(Prescription.builder()
                        .examination(exam)
                        .doctor(pastApp.getDoctor())
                        .patient(p1)
                        .diagnosis("Viêm họng cấp tính (J02.9)")
                        .notes("Uống sau khi ăn no. Tuyệt đối kiêng đồ uống đá lạnh và chất kích thích.")
                        .status("COMPLETED")
                        .prescribedAt(java.time.LocalDateTime.now().minusDays(1).withHour(14).withMinute(25))
                        .build());

                Medication m01 = medicationRepository.findByCode("M01").orElse(null); // Paracetamol
                Medication m06 = medicationRepository.findByCode("M06").orElse(null); // Cetirizine
                Medication m03 = medicationRepository.findByCode("M03").orElse(null); // Omeprazole

                if (m01 != null) {
                    prescriptionItemRepository.save(PrescriptionItem.builder()
                            .prescription(prescription)
                            .medication(m01)
                            .dosage("500mg")
                            .frequency("3 lần/ngày")
                            .duration("5 ngày")
                            .quantity(15)
                            .instruction("Uống 1 viên sau ăn khi sốt > 38.5°C hoặc họng đau nhiều")
                            .build());
                }
                if (m06 != null) {
                    prescriptionItemRepository.save(PrescriptionItem.builder()
                            .prescription(prescription)
                            .medication(m06)
                            .dosage("10mg")
                            .frequency("1 lần/ngày")
                            .duration("5 ngày")
                            .quantity(5)
                            .instruction("Uống 1 viên vào buổi tối trước khi đi ngủ")
                            .build());
                }
                if (m03 != null) {
                    prescriptionItemRepository.save(PrescriptionItem.builder()
                            .prescription(prescription)
                            .medication(m03)
                            .dosage("20mg")
                            .frequency("1 lần/ngày")
                            .duration("7 ngày")
                            .quantity(7)
                            .instruction("Uống 1 viên trước bữa ăn sáng 30 phút để bảo vệ dạ dày")
                            .build());
                }
            }
        }
    }
}