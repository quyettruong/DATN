import 'package:flutter/material.dart';
import '../../config/app_theme.dart';
import '../../models/prescription_model.dart';
import '../../services/hospital_service.dart';
import '../../widgets/skeleton_loader.dart';

class PrescriptionListScreen extends StatefulWidget {
  const PrescriptionListScreen({super.key});

  @override
  State<PrescriptionListScreen> createState() => _PrescriptionListScreenState();
}

class _PrescriptionListScreenState extends State<PrescriptionListScreen> {
  List<PrescriptionModel> _prescriptions = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPrescriptions();
  }

  Future<void> _loadPrescriptions() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await HospitalService.getMyPrescriptions();
      if (!mounted) return;
      setState(() {
        _prescriptions = list;
        _loading = false;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Đơn Thuốc Điện Tử'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loading ? null : _loadPrescriptions,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadPrescriptions,
        child: _loading
            ? ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: 4,
                separatorBuilder: (_, _) => const SizedBox(height: 14),
                itemBuilder: (_, _) => const SkeletonCard(height: 110),
              )
            : _error != null
                ? ListView(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Center(child: Text(_error!)),
                      ),
                    ],
                  )
                : _prescriptions.isEmpty
                    ? ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(height: 60),
                                Container(
                                  width: 80,
                                  height: 80,
                                  decoration: BoxDecoration(
                                    color: AppTheme.secondary.withValues(alpha: 0.08),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.medication_outlined, size: 44, color: AppTheme.secondary),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Chưa Có Đơn Thuốc Nào',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Đơn thuốc của bạn sau khi hoàn tất khám sẽ được hiển thị chi tiết tại đây.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      )
                    : ListView.separated(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        itemCount: _prescriptions.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 14),
                      itemBuilder: (ctx, idx) {
                        final p = _prescriptions[idx];
                        final isDispensed = p.status == 'DISPENSED';

                        return Card(
                          child: ExpansionTile(
                            initiallyExpanded: idx == 0,
                            tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            leading: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: isDispensed
                                    ? AppTheme.success.withValues(alpha: 0.1)
                                    : AppTheme.secondary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                Icons.medication_rounded,
                                color: isDispensed ? AppTheme.success : AppTheme.secondary,
                              ),
                            ),
                            title: Row(
                              children: [
                                Text(
                                  "#RX-${p.id.toString().padLeft(6, '0')}",
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isDispensed ? Colors.green.shade50 : Colors.amber.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: isDispensed ? Colors.green.shade200 : Colors.amber.shade200,
                                    ),
                                  ),
                                  child: Text(
                                    isDispensed ? 'ĐÃ PHÁT THUỐC' : 'CHỜ CẤP PHÁT',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: isDispensed ? Colors.green.shade800 : Colors.amber.shade800,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                "Chẩn đoán: ${p.diagnosis ?? 'Khám lâm sàng'} • ${p.doctorName}",
                                style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                              ),
                            ),
                            children: [
                              const Divider(height: 1),
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'DANH MỤC THUỐC ĐIỆN TỬ:',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.textMuted),
                                    ),
                                    const SizedBox(height: 10),
                                    ...p.items.asMap().entries.map((entry) {
                                      final i = entry.key + 1;
                                      final item = entry.value;
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 10),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              "$i. ",
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                            ),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    item.medicationName,
                                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                                                  ),
                                                  Text(
                                                    "${item.dosage ?? ''} ${item.frequency != null ? '• ${item.frequency}' : ''}",
                                                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                                  ),
                                                  if (item.instruction != null && item.instruction!.isNotEmpty)
                                                    Text(
                                                      "HDSD: ${item.instruction}",
                                                      style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppTheme.primary),
                                                    ),
                                                ],
                                              ),
                                            ),
                                            Text(
                                              "x${item.quantity}",
                                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppTheme.primaryDark),
                                            ),
                                          ],
                                        ),
                                      );
                                    }),
                                    if (p.notes != null && p.notes!.isNotEmpty) ...[
                                      const SizedBox(height: 8),
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF8FAFC),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          "Lời dặn bác sĩ: ${p.notes}",
                                          style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
      ),
    );
  }
}
