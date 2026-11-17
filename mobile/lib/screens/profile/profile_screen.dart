import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import 'server_config_dialog.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Hồ Sơ Y Tế Cá Nhân'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_suggest_rounded),
            tooltip: 'Cấu hình máy chủ API',
            onPressed: () => ServerConfigDialog.show(context),
          ),
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Column(
                    children: [
                      // User Avatar & Name Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Row(
                            children: [
                              Container(
                                width: 64,
                                height: 64,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [AppTheme.primary, AppTheme.accentCyan],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(22),
                                ),
                                child: Center(
                                  child: Text(
                                    user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'U',
                                    style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      user.fullName,
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.textPrimary),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        user.patientCode != null ? "Mã BN: ${user.patientCode}" : "@${user.username}",
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          color: AppTheme.primary,
                                          fontFamily: 'monospace',
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Medical History & Allergies
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.shield_outlined, color: AppTheme.secondary, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Chỉ Số Sinh Học & Tiền Sử Dị Ứng',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _infoRow('Nhóm máu', user.bloodType ?? 'Chưa ghi nhận'),
                              const Divider(height: 16),
                              _infoRow('Tiền sử dị ứng', user.allergies ?? 'Không ghi nhận', isAlert: (user.allergies != null && !user.allergies!.toLowerCase().contains('không'))),
                              const Divider(height: 16),
                              _infoRow('Tiền sử bệnh lý', user.medicalHistory ?? 'Không có'),
                              const Divider(height: 16),
                              _infoRow('Ngày sinh', user.dob ?? 'Chưa cập nhật'),
                              const Divider(height: 16),
                              _infoRow('Giới tính', user.gender == 'MALE' ? 'Nam' : (user.gender == 'FEMALE' ? 'Nữ' : 'Khác')),
                              const Divider(height: 16),
                              _infoRow('Số điện thoại', user.phone?.isNotEmpty == true ? user.phone! : 'Chưa cập nhật'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // App & Server Info
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            children: [
                              ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.dns_rounded, color: AppTheme.primary),
                                title: const Text('Máy chủ API Backend', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                subtitle: const Text('Điều chỉnh IP kết nối máy chủ'),
                                trailing: const Icon(Icons.chevron_right_rounded),
                                onTap: () => ServerConfigDialog.show(context),
                              ),
                              const Divider(height: 1),
                              ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.info_outline_rounded, color: AppTheme.secondary),
                                title: const Text('Ứng dụng MediCare Patient', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                subtitle: const Text('Phiên bản 1.0.0 (Flutter Enterprise)'),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Logout Button
                      OutlinedButton.icon(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              title: const Text('Đăng Xuất', style: TextStyle(fontWeight: FontWeight.w800)),
                              content: const Text('Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?'),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    auth.logout();
                                  },
                                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
                                  child: const Text('Đăng Xuất'),
                                ),
                              ],
                            ),
                          );
                        },
                        icon: const Icon(Icons.logout_rounded, color: AppTheme.error),
                        label: const Text('Đăng Xuất Tài Khoản', style: TextStyle(color: AppTheme.error, fontWeight: FontWeight.w800)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.error),
                          minimumSize: const Size.fromHeight(48),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _infoRow(String label, String value, {bool isAlert = false}) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 3,
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: isAlert ? AppTheme.error : AppTheme.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
