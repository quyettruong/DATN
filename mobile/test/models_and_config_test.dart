import 'package:flutter_test/flutter_test.dart';
import 'package:medicare_patient_app/config/app_config.dart';
import 'package:medicare_patient_app/models/user_model.dart';
import 'package:medicare_patient_app/models/department_model.dart';
import 'package:medicare_patient_app/models/appointment_model.dart';
import 'package:medicare_patient_app/models/prescription_model.dart';

void main() {
  group('AppConfig Tests', () {
    test('Default base URL returns non-empty url', () {
      final defaultUrl = AppConfig.defaultBaseUrl;
      expect(defaultUrl.startsWith('http'), isTrue);
      expect(defaultUrl.endsWith('/api'), isTrue);
    });
  });

  group('Model Serialization Tests', () {
    test('UserModel.fromJson parses complete patient data', () {
      final json = {
        'id': 101,
        'username': 'patient1',
        'fullName': 'Lê Thị Mai',
        'email': 'mai@example.com',
        'phone': '0901234567',
        'role': 'PATIENT',
        'patientCode': 'BN-101',
        'gender': 'FEMALE',
        'dob': '1995-04-12',
        'bloodType': 'O+',
        'allergies': 'Penicillin',
        'address': 'Hà Nội'
      };

      final user = UserModel.fromJson(json);
      expect(user.id, 101);
      expect(user.username, 'patient1');
      expect(user.fullName, 'Lê Thị Mai');
      expect(user.allergies, 'Penicillin');
      expect(user.bloodType, 'O+');
      expect(user.patientCode, 'BN-101');
    });

    test('DepartmentModel and DoctorModel parse accurately', () {
      final deptJson = {
        'id': 1,
        'name': 'Khoa Nội Tổng Quát',
        'description': 'Khám và điều trị các bệnh nội khoa'
      };
      final dept = DepartmentModel.fromJson(deptJson);
      expect(dept.id, 1);
      expect(dept.name, 'Khoa Nội Tổng Quát');

      final docJson = {
        'id': 5,
        'fullName': 'BS. Nguyễn Văn An',
        'specialization': 'Nội khoa',
        'qualification': 'Thạc sĩ Y khoa',
        'departmentId': 1,
        'departmentName': 'Khoa Nội Tổng Quát'
      };
      final doc = DoctorModel.fromJson(docJson);
      expect(doc.id, 5);
      expect(doc.fullName, 'BS. Nguyễn Văn An');
      expect(doc.specialization, 'Nội khoa');
    });

    test('QueueTicketModel parses and formats correctly', () {
      final ticketJson = {
        'id': 42,
        'queueNumber': 'N-001',
        'patientName': 'Lê Thị Mai',
        'patientCode': 'BN-101',
        'roomName': 'Phòng 101',
        'doctorName': 'BS. Nguyễn Văn An',
        'queueDate': '2026-11-13',
        'status': 'CALLED',
        'priorityScore': 100,
        'isWalkIn': false
      };
      final ticket = QueueTicketModel.fromJson(ticketJson);
      expect(ticket.id, 42);
      expect(ticket.queueNumber, 'N-001');
      expect(ticket.status, 'CALLED');
      expect(ticket.doctorName, 'BS. Nguyễn Văn An');
    });

    test('InvoiceModel parses fees and discounts accurately', () {
      final invoiceJson = {
        'id': 7,
        'invoiceNumber': 'INV-20261113-001',
        'consultationFee': 150000.0,
        'labFee': 250000.0,
        'medicationFee': 180000.0,
        'discountAmount': 464000.0,
        'totalAmount': 580000.0,
        'paidAmount': 116000.0,
        'remainingAmount': 0.0,
        'status': 'PAID'
      };
      final invoice = InvoiceModel.fromJson(invoiceJson);
      expect(invoice.id, 7);
      expect(invoice.totalAmount, 580000.0);
      expect(invoice.discountAmount, 464000.0);
      expect(invoice.remainingAmount, 0.0);
      expect(invoice.status, 'PAID');
    });
  });
}
