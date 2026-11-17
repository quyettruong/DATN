import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../config/app_theme.dart';
import '../../models/prescription_model.dart';
import '../../services/hospital_service.dart';
import '../../widgets/skeleton_loader.dart';

class InvoiceListScreen extends StatefulWidget {
  const InvoiceListScreen({super.key});

  @override
  State<InvoiceListScreen> createState() => _InvoiceListScreenState();
}

class _InvoiceListScreenState extends State<InvoiceListScreen> {
  List<InvoiceModel> _invoices = [];
  bool _loading = true;
  String? _error;

  final currencyFormatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await HospitalService.getMyInvoices();
      if (!mounted) return;
      setState(() {
        _invoices = list;
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

  void _showVietQrModal(InvoiceModel invoice) {
    final amountToPay = invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.totalAmount;
    final memo = "MEDICARE ${invoice.invoiceNumber}";
    bool paying = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return SafeArea(
            child: Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.9,
              ),
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.qr_code_2_rounded, color: AppTheme.primary, size: 28),
                      SizedBox(width: 8),
                      Text(
                        'Thanh Toán VietQR NAPAS 247',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Hóa đơn: ${invoice.invoiceNumber}',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontFamily: 'monospace'),
                  ),
                  const SizedBox(height: 18),

                  // QR Code Box
                  Container(
                    padding: const EdgeInsets.all(12),
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
                      data: "https://img.vietqr.io/image/970423-0900000000-compact2.png?amount=${amountToPay.toInt()}&addInfo=$memo&accountName=BENH%20VIEN%20MEDICARE",
                      version: QrVersions.auto,
                      size: 190.0,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Amount
                  Text(
                    currencyFormatter.format(amountToPay),
                    style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppTheme.primary),
                  ),
                  const SizedBox(height: 14),

                  // Transfer Details Box
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.background,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Column(
                      children: [
                        _copyRow('Ngân hàng', 'TPBank (Ngân hàng Tiên Phong)'),
                        const Divider(height: 16),
                        _copyRow('Số tài khoản', '0900000000', canCopy: true),
                        const Divider(height: 16),
                        _copyRow('Chủ tài khoản', 'BENH VIEN MEDICARE'),
                        const Divider(height: 16),
                        _copyRow('Nội dung', memo, canCopy: true),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Confirm Button
                  ElevatedButton.icon(
                    onPressed: paying
                        ? null
                        : () async {
                            final messenger = ScaffoldMessenger.of(context);
                            setModalState(() => paying = true);
                            try {
                              await HospitalService.payInvoice(invoice.id, amountToPay);
                              if (ctx.mounted) {
                                Navigator.pop(ctx);
                              }
                              if (mounted) {
                                messenger.showSnackBar(
                                  const SnackBar(
                                    content: Text('Thanh toán viện phí thành công!'),
                                    backgroundColor: AppTheme.success,
                                  ),
                                );
                                _loadInvoices();
                              }
                            } catch (e) {
                              setModalState(() => paying = false);
                              if (mounted) {
                                messenger.showSnackBar(
                                  SnackBar(content: Text('Lỗi: ${e.toString()}'), backgroundColor: AppTheme.error),
                                );
                              }
                            }
                          },
                    icon: paying
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Icon(Icons.check_circle_outline_rounded),
                    label: const Text('Xác Nhận Đã Chuyển Khoản'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(50),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
        },
      ),
    );
  }

  Widget _copyRow(String label, String value, {bool canCopy = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
        Row(
          children: [
            Text(
              value,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
            ),
            if (canCopy) ...[
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: value));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Đã sao chép $value'), duration: const Duration(seconds: 1)),
                  );
                },
                child: const Icon(Icons.copy_rounded, size: 15, color: AppTheme.primary),
              ),
            ],
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Hóa Đơn & Viện Phí BHYT'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loading ? null : _loadInvoices,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadInvoices,
        child: _loading
            ? ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: 4,
                separatorBuilder: (_, _) => const SizedBox(height: 14),
                itemBuilder: (_, _) => const SkeletonCard(height: 120),
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
                : _invoices.isEmpty
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
                                    color: AppTheme.primary.withValues(alpha: 0.08),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.receipt_long_outlined, size: 44, color: AppTheme.primary),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Không Có Hóa Đơn Nào',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Các khoản phí khám, xét nghiệm và thuốc sẽ hiển thị chi tiết tại đây.',
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
                        itemCount: _invoices.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 14),
                      itemBuilder: (ctx, idx) {
                        final inv = _invoices[idx];
                        final isPaid = inv.status == 'PAID';

                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      inv.invoiceNumber,
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, fontFamily: 'monospace'),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: isPaid ? Colors.green.shade50 : const Color(0xFFFFF1F2),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: isPaid ? Colors.green.shade200 : const Color(0xFFFECDD3),
                                        ),
                                      ),
                                      child: Text(
                                        isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                          color: isPaid ? Colors.green.shade800 : const Color(0xFF9F1239),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),

                                // Summary items
                                _feeLine('Phí khám chuyên khoa', inv.consultationFee),
                                if (inv.labFee > 0) _feeLine('Phí xét nghiệm cận lâm sàng', inv.labFee),
                                if (inv.medicationFee > 0) _feeLine('Phí thuốc theo đơn', inv.medicationFee),
                                if (inv.discountAmount > 0)
                                  _feeLine('Quỹ BHYT / Giảm trừ chi trả', -inv.discountAmount, isDiscount: true),
                                const Divider(height: 18),

                                // Total row
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Tổng thanh toán:', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                                    Text(
                                      currencyFormatter.format(inv.totalAmount),
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.primary),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),

                                // Pay Button if unpaid
                                if (!isPaid)
                                  ElevatedButton.icon(
                                    onPressed: () => _showVietQrModal(inv),
                                    icon: const Icon(Icons.qr_code_rounded, size: 18),
                                    label: const Text('Thanh Toán VietQR Ngay'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primary,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
      ),
    );
  }

  Widget _feeLine(String label, double amount, {bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: isDiscount ? AppTheme.success : AppTheme.textSecondary)),
          Text(
            (amount < 0 ? "-" : "") + currencyFormatter.format(amount.abs()),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isDiscount ? AppTheme.success : AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
