import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../config/app_theme.dart';
import '../../models/appointment_model.dart';
import '../../services/hospital_service.dart';

class DigitalTicketScreen extends StatefulWidget {
  final QueueTicketModel? initialTicket;

  const DigitalTicketScreen({super.key, this.initialTicket});

  @override
  State<DigitalTicketScreen> createState() => _DigitalTicketScreenState();
}

class _DigitalTicketScreenState extends State<DigitalTicketScreen> {
  QueueTicketModel? _ticket;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _ticket = widget.initialTicket;
    if (_ticket == null) {
      _loadLatestTicket();
    }
  }

  Future<void> _loadLatestTicket() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final tickets = await HospitalService.getMyQueueTickets();
      if (!mounted) return;
      if (tickets.isNotEmpty) {
        // Find active ticket (WAITING, CALLED, IN_EXAM) or latest
        final active = tickets.firstWhere(
          (t) => ['WAITING', 'CALLED', 'IN_EXAM'].contains(t.status),
          orElse: () => tickets.first,
        );
        setState(() => _ticket = active);
      } else {
        setState(() => _ticket = null);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CALLED':
        return AppTheme.warning;
      case 'IN_EXAM':
        return AppTheme.primary;
      case 'COMPLETED':
        return AppTheme.success;
      case 'SKIPPED':
        return AppTheme.error;
      case 'WAITING':
      default:
        return AppTheme.secondary;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'CALLED':
        return 'ĐANG GỌI VÀO PHÒNG';
      case 'IN_EXAM':
        return 'ĐANG KHÁM BỆNH';
      case 'COMPLETED':
        return 'ĐÃ HOÀN TẤT KHÁM';
      case 'SKIPPED':
        return 'ĐÃ QUA LƯỢT';
      case 'WAITING':
      default:
        return 'ĐANG CHỜ GỌI SỐ';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Vé Khám Điện Tử QR'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Làm mới số thứ tự',
            onPressed: _loading ? null : _loadLatestTicket,
          ),
        ],
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
                        const Icon(Icons.error_outline_rounded, size: 48, color: AppTheme.error),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _loadLatestTicket, child: const Text('Thử lại')),
                      ],
                    ),
                  ),
                )
              : _ticket == null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withValues(alpha: 0.08),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.confirmation_number_outlined, size: 44, color: AppTheme.primary),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Chưa Có Phiếu Khám Hôm Nay',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Vui lòng đặt lịch khám hoặc đến Quầy tiếp nhận bệnh viện để nhận số thứ tự.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton.icon(
                              onPressed: _loadLatestTicket,
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Kiểm Tra Lại'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadLatestTicket,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(20),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 440),
                            child: Column(
                              children: [
                                // Called Status Banner
                                if (_ticket!.status == 'CALLED')
                                  Container(
                                    margin: const EdgeInsets.only(bottom: 16),
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.shade50,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: Colors.amber.shade300, width: 1.5),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.campaign_rounded, color: Colors.amber, size: 28),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              const Text(
                                                'ĐẾN LƯỢT KHÁM CỦA BẠN!',
                                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.amber),
                                              ),
                                              Text(
                                                'Mời bạn vào ${_ticket!.roomName} gặp ${_ticket!.doctorName}',
                                                style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                              // Ticket Pass Card
                              Card(
                                elevation: 2,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(28),
                                  side: const BorderSide(color: AppTheme.border),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(24),
                                  child: Column(
                                    children: [
                                      // Hospital Brand
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Row(
                                            children: [
                                              Icon(Icons.local_hospital_rounded, color: AppTheme.primary, size: 22),
                                              SizedBox(width: 8),
                                              Text(
                                                'BỆNH VIỆN MEDICARE',
                                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppTheme.primary),
                                              ),
                                            ],
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: _getStatusColor(_ticket!.status).withValues(alpha: 0.12),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(
                                              _getStatusText(_ticket!.status),
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w900,
                                                color: _getStatusColor(_ticket!.status),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 20),

                                      // Big Queue Number (tap to copy)
                                      InkWell(
                                        borderRadius: BorderRadius.circular(16),
                                        onTap: () {
                                          Clipboard.setData(ClipboardData(text: _ticket!.queueNumber));
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Đã sao chép Số thứ tự: ${_ticket!.queueNumber}'),
                                              duration: const Duration(seconds: 2),
                                            ),
                                          );
                                        },
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                          child: Text(
                                            _ticket!.queueNumber,
                                            style: TextStyle(
                                              fontSize: 54,
                                              fontWeight: FontWeight.w900,
                                              color: _getStatusColor(_ticket!.status),
                                              letterSpacing: 2,
                                              height: 1,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        _ticket!.patientName.toUpperCase(),
                                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                                      ),
                                      if (_ticket!.patientCode != null)
                                        InkWell(
                                          borderRadius: BorderRadius.circular(8),
                                          onTap: () {
                                            Clipboard.setData(ClipboardData(text: _ticket!.patientCode!));
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text('Đã sao chép Mã bệnh nhân: ${_ticket!.patientCode}'),
                                                duration: const Duration(seconds: 2),
                                              ),
                                            );
                                          },
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            child: Text(
                                              'Mã bệnh nhân: ${_ticket!.patientCode}',
                                              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted, fontFamily: 'monospace'),
                                            ),
                                          ),
                                        ),
                                      const SizedBox(height: 20),

                                      // QR Code View
                                      Container(
                                        padding: const EdgeInsets.all(14),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(color: AppTheme.border),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: 0.04),
                                              blurRadius: 10,
                                              offset: const Offset(0, 4),
                                            ),
                                          ],
                                        ),
                                        child: QrImageView(
                                          data: 'MEDICARE|${_ticket!.queueNumber}|${_ticket!.patientCode ?? ''}|${_ticket!.id}',
                                          version: QrVersions.auto,
                                          size: 170.0,
                                          eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppTheme.primaryDark),
                                          dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: AppTheme.textPrimary),
                                        ),
                                      ),
                                      const SizedBox(height: 10),
                                      const Text(
                                        'Quét mã này tại Kiosk Tiếp Nhận hoặc Cửa Phòng Khám',
                                        style: TextStyle(fontSize: 11, color: AppTheme.textMuted, fontStyle: FontStyle.italic),
                                      ),
                                      const SizedBox(height: 20),
                                      const Divider(height: 1),
                                      const SizedBox(height: 18),

                                      // Ticket Details
                                      _detailRow('Phòng khám', _ticket!.roomName, Icons.meeting_room_outlined),
                                      const SizedBox(height: 10),
                                      _detailRow('Bác sĩ phụ trách', _ticket!.doctorName, Icons.person_outline_rounded),
                                      const SizedBox(height: 10),
                                      if (_ticket!.queueDate != null)
                                        _detailRow('Ngày khám', _ticket!.queueDate!, Icons.calendar_today_outlined),
                                      if (_ticket!.reason != null && _ticket!.reason!.isNotEmpty) ...[
                                        const SizedBox(height: 10),
                                        _detailRow('Lý do khám', _ticket!.reason!, Icons.notes_outlined),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
    );
  }

  Widget _detailRow(String title, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppTheme.textSecondary),
        const SizedBox(width: 10),
        Expanded(
          flex: 2,
          child: Text(
            title,
            style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 3,
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
          ),
        ),
      ],
    );
  }
}
