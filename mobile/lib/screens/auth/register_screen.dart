import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  String _gender = 'MALE';

  @override
  void dispose() {
    _fullNameCtrl.dispose();
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    _phoneCtrl.dispose();
    _dobCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = Provider.of<AuthProvider>(context, listen: false);

    final success = await auth.register(
      username: _usernameCtrl.text,
      password: _passwordCtrl.text,
      fullName: _fullNameCtrl.text,
      phone: _phoneCtrl.text,
      gender: _gender,
      dob: _dobCtrl.text.isNotEmpty ? _dobCtrl.text : null,
      address: _addressCtrl.text,
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đăng ký hồ sơ thành công! Đang tự động đăng nhập...'),
            backgroundColor: AppTheme.success,
          ),
        );
        // Auto login
        await auth.login(_usernameCtrl.text, _passwordCtrl.text);
        if (mounted) Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(auth.errorMessage ?? 'Đăng ký không thành công'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Tạo Hồ Sơ Khám Bệnh'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Thông Tin Người Bệnh',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Họ và tên
                        TextFormField(
                          controller: _fullNameCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Họ và tên *',
                            prefixIcon: Icon(Icons.badge_outlined),
                          ),
                          validator: (v) =>
                              v == null || v.trim().isEmpty ? 'Vui lòng nhập họ và tên' : null,
                        ),
                        const SizedBox(height: 12),

                        // Tên đăng nhập
                        TextFormField(
                          controller: _usernameCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Tên đăng nhập *',
                            prefixIcon: Icon(Icons.person_outline_rounded),
                          ),
                          validator: (v) =>
                              v == null || v.trim().isEmpty ? 'Vui lòng nhập tên đăng nhập' : null,
                        ),
                        const SizedBox(height: 12),

                        // Mật khẩu
                        TextFormField(
                          controller: _passwordCtrl,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Mật khẩu (ít nhất 6 ký tự) *',
                            prefixIcon: Icon(Icons.lock_outline_rounded),
                          ),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'Vui lòng nhập mật khẩu';
                            if (v.trim().length < 6) return 'Mật khẩu phải từ 6 ký tự trở lên';
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),

                        // Số điện thoại
                        TextFormField(
                          controller: _phoneCtrl,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: 'Số điện thoại',
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Giới tính
                        DropdownButtonFormField<String>(
                          initialValue: _gender,
                          decoration: const InputDecoration(
                            labelText: 'Giới tính',
                            prefixIcon: Icon(Icons.wc_outlined),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'MALE', child: Text('Nam')),
                            DropdownMenuItem(value: 'FEMALE', child: Text('Nữ')),
                            DropdownMenuItem(value: 'OTHER', child: Text('Khác')),
                          ],
                          onChanged: (v) => setState(() => _gender = v ?? 'MALE'),
                        ),
                        const SizedBox(height: 12),

                        // Ngày sinh YYYY-MM-DD
                        TextFormField(
                          controller: _dobCtrl,
                          readOnly: true,
                          onTap: () async {
                            final now = DateTime.now();
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: DateTime(1995, 1, 1),
                              firstDate: DateTime(1920),
                              lastDate: now,
                            );
                            if (picked != null) {
                              _dobCtrl.text =
                                  "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                            }
                          },
                          decoration: const InputDecoration(
                            labelText: 'Ngày sinh (Chạm để chọn)',
                            prefixIcon: Icon(Icons.calendar_month_outlined),
                            suffixIcon: Icon(Icons.arrow_drop_down),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Địa chỉ
                        TextFormField(
                          controller: _addressCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Địa chỉ thường trú',
                            prefixIcon: Icon(Icons.home_outlined),
                          ),
                        ),
                        const SizedBox(height: 22),

                        // Nút Đăng ký
                        ElevatedButton(
                          onPressed: auth.isLoading ? null : _submit,
                          child: auth.isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2.5,
                                  ),
                                )
                              : const Text('Hoàn Tất Đăng Ký'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
