import 'package:flutter/material.dart';
import '../../config/app_theme.dart';
import '../../models/department_model.dart';
import '../../services/hospital_service.dart';
import '../queue/digital_ticket_screen.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  bool _loading = true;
  String? _error;

  List<DepartmentModel> _departments = [];
  DepartmentModel? _selectedDept;

  List<DoctorModel> _doctors = [];
  DoctorModel? _selectedDoctor;

  List<DoctorScheduleModel> _schedules = [];
  DoctorScheduleModel? _selectedSchedule;

  DateTime _selectedDate = DateTime.now();
  String _selectedTime = '08:30';
  final _reasonCtrl = TextEditingController(text: 'Khám sức khỏe tổng quát');
  bool _submitting = false;

  final List<String> _timeSlots = [
    '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  @override
  void initState() {
    super.initState();
    _loadDepartments();
  }

  @override
  void dispose() {
    _reasonCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadDepartments() async {
    try {
      final depts = await HospitalService.getDepartments();
      if (!mounted) return;
      setState(() {
        _departments = depts;
        if (depts.isNotEmpty) {
          _selectedDept = depts.first;
          _loadDoctors(depts.first.id);
        } else {
          _loading = false;
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _loadDoctors(int deptId) async {
    setState(() => _loading = true);
    try {
      final docs = await HospitalService.getDoctors(departmentId: deptId);
      if (!mounted) return;
      setState(() {
        _doctors = docs;
        if (docs.isNotEmpty) {
          _selectedDoctor = docs.first;
          _loadSchedules(docs.first.id);
        } else {
          _selectedDoctor = null;
          _schedules = [];
          _loading = false;
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _loadSchedules(int doctorId) async {
    final dateStr =
        "${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}";
    try {
      final scheds = await HospitalService.getDoctorSchedules(doctorId, dateStr);
      if (!mounted) return;
      setState(() {
        _schedules = scheds;
        if (scheds.isNotEmpty) {
          _selectedSchedule = scheds.first;
        } else {
          _selectedSchedule = null;
        }
        _loading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _onDepartmentChanged(DepartmentModel? dept) {
    if (dept == null) return;
    setState(() {
      _selectedDept = dept;
    });
    _loadDoctors(dept.id);
  }

  void _onDoctorChanged(DoctorModel? doc) {
    if (doc == null) return;
    setState(() {
      _selectedDoctor = doc;
    });
    _loadSchedules(doc.id);
  }

  void _submitBooking() async {
    if (_selectedDoctor == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn bác sĩ khám')),
      );
      return;
    }

    setState(() => _submitting = true);
    final dateStr =
        "${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}";

    try {
      await HospitalService.createAppointment(
        doctorId: _selectedDoctor!.id,
        scheduleId: _selectedSchedule?.id,
        appointmentDate: dateStr,
        startTime: _selectedTime,
        reason: _reasonCtrl.text,
      );

      if (!mounted) return;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 28),
              SizedBox(width: 10),
              Text('Đặt Lịch Thành Công!', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            ],
          ),
          content: Text(
            'Lịch khám tại ${_selectedDept?.name ?? ''} cùng ${_selectedDoctor?.fullName ?? ''} vào ngày $dateStr lúc $_selectedTime đã được ghi nhận vào hệ thống.',
            style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('Đóng'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const DigitalTicketScreen()),
                );
              },
              child: const Text('Xem Vé Khám QR'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi đặt lịch: ${e.toString()}'), backgroundColor: AppTheme.error),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Đặt Lịch Khám Chuyên Khoa'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.cloud_off_rounded, size: 52, color: AppTheme.error),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14)),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            setState(() {
                              _loading = true;
                              _error = null;
                            });
                            _loadDepartments();
                          },
                          icon: const Icon(Icons.refresh_rounded),
                          label: const Text('Thử Lại'),
                        ),
                      ],
                    ),
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 500),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // 1. Chọn Chuyên khoa
                          _sectionHeader('1. Chọn Chuyên Khoa', Icons.domain_rounded),
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<DepartmentModel>(
                                  value: _selectedDept,
                                  isExpanded: true,
                                  items: _departments.map((d) {
                                    return DropdownMenuItem(
                                      value: d,
                                      child: Text(
                                        d.name,
                                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: _onDepartmentChanged,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 18),

                          // 2. Chọn Bác sĩ
                          _sectionHeader('2. Chọn Bác Sĩ Chuyên Khoa', Icons.person_rounded),
                          if (_doctors.isEmpty)
                            const Padding(
                              padding: EdgeInsets.all(12),
                              child: Text('Khoa này chưa có bác sĩ trực khả dụng', style: TextStyle(color: AppTheme.textMuted)),
                            )
                          else
                            Card(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<DoctorModel>(
                                    value: _selectedDoctor,
                                    isExpanded: true,
                                    items: _doctors.map((doc) {
                                      return DropdownMenuItem(
                                        value: doc,
                                        child: Text(
                                          "${doc.fullName} (${doc.specialization})",
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                        ),
                                      );
                                    }).toList(),
                                    onChanged: _onDoctorChanged,
                                  ),
                                ),
                              ),
                            ),
                          if (_schedules.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              "Bác sĩ có ${_schedules.length} ca trực trong ngày đã chọn",
                              style: const TextStyle(fontSize: 12, color: AppTheme.success, fontWeight: FontWeight.w600),
                            ),
                          ],
                          const SizedBox(height: 18),

                          // 3. Chọn Ngày khám
                          _sectionHeader('3. Chọn Ngày Khám', Icons.calendar_month_rounded),
                          Card(
                            child: ListTile(
                              leading: const Icon(Icons.event_available_rounded, color: AppTheme.primary),
                              title: Text(
                                "${_selectedDate.day.toString().padLeft(2, '0')}/${_selectedDate.month.toString().padLeft(2, '0')}/${_selectedDate.year}",
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                              ),
                              subtitle: const Text('Nhấn để đổi ngày khám tiếp theo'),
                              trailing: const Icon(Icons.chevron_right_rounded),
                              onTap: () async {
                                final now = DateTime.now();
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: _selectedDate,
                                  firstDate: now,
                                  lastDate: now.add(const Duration(days: 30)),
                                );
                                if (picked != null) {
                                  setState(() => _selectedDate = picked);
                                  if (_selectedDoctor != null) {
                                    _loadSchedules(_selectedDoctor!.id);
                                  }
                                }
                              },
                            ),
                          ),
                          const SizedBox(height: 18),

                          // 4. Chọn Giờ khám
                          _sectionHeader('4. Khung Giờ Khám Dự Kiến', Icons.access_time_rounded),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _timeSlots.map((time) {
                              final isSelected = _selectedTime == time;
                              return ChoiceChip(
                                label: Text(time),
                                selected: isSelected,
                                selectedColor: AppTheme.primary,
                                labelStyle: TextStyle(
                                  color: isSelected ? Colors.white : AppTheme.textPrimary,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                onSelected: (_) => setState(() => _selectedTime = time),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 18),

                          // 5. Lý do khám
                          _sectionHeader('5. Triệu Chứng / Lý Do Khám', Icons.edit_note_rounded),
                          TextFormField(
                            controller: _reasonCtrl,
                            maxLines: 2,
                            decoration: const InputDecoration(
                              hintText: 'Ví dụ: Đau họng 3 ngày, sốt nhẹ, ho có đờm...',
                            ),
                          ),
                          const SizedBox(height: 26),

                          // Submit Button
                          ElevatedButton.icon(
                            onPressed: _submitting ? null : _submitBooking,
                            icon: _submitting
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Icon(Icons.check_rounded),
                            label: const Text('Xác Nhận Đặt Lịch & Nhận Số QR'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppTheme.primary),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
          ),
        ],
      ),
    );
  }
}
