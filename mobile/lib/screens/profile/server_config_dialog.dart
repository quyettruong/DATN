import 'package:flutter/material.dart';
import '../../config/app_config.dart';
import '../../config/app_theme.dart';

class ServerConfigDialog extends StatefulWidget {
  const ServerConfigDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (ctx) => const ServerConfigDialog(),
    );
  }

  @override
  State<ServerConfigDialog> createState() => _ServerConfigDialogState();
}

class _ServerConfigDialogState extends State<ServerConfigDialog> {
  late TextEditingController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
    _loadCurrentUrl();
  }

  Future<void> _loadCurrentUrl() async {
    final current = await AppConfig.getBaseUrl();
    if (!mounted) return;
    setState(() {
      _controller.text = current;
      _loading = false;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      title: const Row(
        children: [
          Icon(Icons.dns_rounded, color: AppTheme.primary),
          SizedBox(width: 10),
          Text(
            'Cấu Hình Máy Chủ API',
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
          ),
        ],
      ),
      content: _loading
          ? const SizedBox(
              height: 80,
              child: Center(child: CircularProgressIndicator()),
            )
          : Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Địa chỉ Backend Spring Boot:',
                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _controller,
                  decoration: const InputDecoration(
                    hintText: 'http://10.0.2.2:8080/api',
                    prefixIcon: Icon(Icons.link_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Gợi ý cấu hình:',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _presetChip('Android Giả Lập', 'http://10.0.2.2:8080/api'),
                    _presetChip('Máy tính / Web', 'http://localhost:8080/api'),
                  ],
                ),
              ],
            ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Hủy'),
        ),
        ElevatedButton(
          onPressed: () async {
            if (_controller.text.trim().isNotEmpty) {
              final nav = Navigator.of(context);
              final messenger = ScaffoldMessenger.of(context);
              await AppConfig.setBaseUrl(_controller.text.trim());
              if (!mounted) return;
              nav.pop();
              messenger.showSnackBar(
                const SnackBar(content: Text('Đã cập nhật máy chủ API')),
              );
            }
          },
          child: const Text('Lưu'),
        ),
      ],
    );
  }

  Widget _presetChip(String label, String url) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 11)),
      onPressed: () => setState(() => _controller.text = url),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
