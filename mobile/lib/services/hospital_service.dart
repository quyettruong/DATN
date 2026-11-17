import '../models/department_model.dart';
import '../models/appointment_model.dart';
import '../models/prescription_model.dart';
import 'api_service.dart';

class HospitalService {
  // ── Departments & Doctors ──
  static Future<List<DepartmentModel>> getDepartments() async {
    final res = await ApiService.get('/departments');
    if (res is List) {
      return res.map((d) => DepartmentModel.fromJson(d as Map<String, dynamic>)).toList();
    }
    return [];
  }

  static Future<List<DoctorModel>> getDoctors({int? departmentId}) async {
    final endpoint = departmentId != null ? '/doctors?departmentId=$departmentId' : '/doctors';
    final res = await ApiService.get(endpoint);
    if (res is List) {
      return res.map((d) => DoctorModel.fromJson(d as Map<String, dynamic>)).toList();
    }
    return [];
  }

  static Future<List<DoctorScheduleModel>> getDoctorSchedules(int doctorId, String date) async {
    final res = await ApiService.get('/doctors/$doctorId/schedules?date=$date');
    if (res is List) {
      return res.map((s) => DoctorScheduleModel.fromJson(s as Map<String, dynamic>)).toList();
    }
    return [];
  }

  // ── Appointments ──
  static Future<AppointmentModel> createAppointment({
    required int doctorId,
    int? scheduleId,
    required String appointmentDate,
    required String startTime,
    required String reason,
  }) async {
    // Format startTime to "HH:mm:ss" if only "HH:mm"
    String formattedTime = startTime;
    if (formattedTime.length == 5) {
      formattedTime = '$formattedTime:00';
    }

    final data = {
      'doctorId': doctorId,
      'scheduleId': ?scheduleId,
      'appointmentDate': appointmentDate,
      'startTime': formattedTime,
      'reason': reason.trim().isEmpty ? 'Khám sức khỏe ngoại trú' : reason.trim(),
    };

    final res = await ApiService.post('/appointments', data);
    return AppointmentModel.fromJson(res as Map<String, dynamic>);
  }

  static Future<List<AppointmentModel>> getMyAppointments() async {
    final res = await ApiService.get('/appointments/my');
    if (res is List) {
      return res.map((a) => AppointmentModel.fromJson(a as Map<String, dynamic>)).toList();
    }
    return [];
  }

  static Future<void> cancelAppointment(int id) async {
    await ApiService.post('/appointments/$id/cancel', {});
  }

  // ── Queue & Digital Ticket ──
  static Future<List<QueueTicketModel>> getMyQueueTickets() async {
    final res = await ApiService.get('/queues/my-ticket');
    if (res is List) {
      return res.map((q) => QueueTicketModel.fromJson(q as Map<String, dynamic>)).toList();
    }
    return [];
  }

  static Future<List<QueueTicketModel>> getQueueByRoom(int roomId, String date) async {
    final res = await ApiService.get('/queues/room/$roomId?date=$date');
    if (res is List) {
      return res.map((q) => QueueTicketModel.fromJson(q as Map<String, dynamic>)).toList();
    }
    return [];
  }

  // ── Prescriptions ──
  static Future<List<PrescriptionModel>> getMyPrescriptions() async {
    final res = await ApiService.get('/prescriptions/my');
    if (res is List) {
      return res.map((p) => PrescriptionModel.fromJson(p as Map<String, dynamic>)).toList();
    }
    return [];
  }

  // ── Invoices & VietQR ──
  static Future<List<InvoiceModel>> getMyInvoices() async {
    final res = await ApiService.get('/billing/invoices/my');
    if (res is List) {
      return res.map((i) => InvoiceModel.fromJson(i as Map<String, dynamic>)).toList();
    }
    return [];
  }

  static Future<InvoiceModel> payInvoice(int invoiceId, double amount, {String method = 'TRANSFER'}) async {
    final res = await ApiService.post('/billing/invoices/$invoiceId/pay', {
      'amount': amount,
      'paymentMethod': method,
      'notes': 'Thanh toán trực tuyến qua ứng dụng di động MediCare',
    });
    return InvoiceModel.fromJson(res as Map<String, dynamic>);
  }

  // ── Follow-ups ──
  static Future<List<dynamic>> getMyFollowUps() async {
    final res = await ApiService.get('/follow-ups/my');
    if (res is List) return res;
    return [];
  }
}
