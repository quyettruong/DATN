import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class ApiService {
  static const String _tokenKey = 'jwt_token';
  static String? _cachedToken;

  static Future<String?> getToken() async {
    if (_cachedToken != null) return _cachedToken;
    final prefs = await SharedPreferences.getInstance();
    _cachedToken = prefs.getString(_tokenKey);
    return _cachedToken;
  }

  static Future<void> setToken(String token) async {
    _cachedToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> clearToken() async {
    _cachedToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  static Future<dynamic> get(String endpoint) async {
    final baseUrl = await AppConfig.getBaseUrl();
    final url = Uri.parse('$baseUrl$endpoint');
    try {
      final headers = await _getHeaders();
      final response = await http.get(url, headers: headers).timeout(const Duration(seconds: 12));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Không thể kết nối đến máy chủ ($baseUrl). Vui lòng kiểm tra địa chỉ IP trong Cài đặt.');
    } on TimeoutException {
      throw ApiException('Kết nối máy chủ quá thời gian (12s). Vui lòng kiểm tra mạng hoặc thử lại.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Lỗi kết nối: ${e.toString()}');
    }
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final baseUrl = await AppConfig.getBaseUrl();
    final url = Uri.parse('$baseUrl$endpoint');
    try {
      final headers = await _getHeaders();
      final response = await http
          .post(url, headers: headers, body: jsonEncode(data))
          .timeout(const Duration(seconds: 12));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Không thể kết nối đến máy chủ ($baseUrl). Vui lòng kiểm tra địa chỉ IP trong Cài đặt.');
    } on TimeoutException {
      throw ApiException('Kết nối máy chủ quá thời gian (12s). Vui lòng kiểm tra mạng hoặc thử lại.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Lỗi kết nối: ${e.toString()}');
    }
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    final baseUrl = await AppConfig.getBaseUrl();
    final url = Uri.parse('$baseUrl$endpoint');
    try {
      final headers = await _getHeaders();
      final response = await http
          .put(url, headers: headers, body: jsonEncode(data))
          .timeout(const Duration(seconds: 12));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Không thể kết nối đến máy chủ ($baseUrl). Vui lòng kiểm tra địa chỉ IP trong Cài đặt.');
    } on TimeoutException {
      throw ApiException('Kết nối máy chủ quá thời gian (12s). Vui lòng kiểm tra mạng hoặc thử lại.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Lỗi kết nối: ${e.toString()}');
    }
  }

  static dynamic _processResponse(http.Response response) {
    dynamic decoded;
    try {
      decoded = jsonDecode(utf8.decode(response.bodyBytes));
    } catch (_) {
      decoded = response.body;
    }

    if (response.statusCode == 401) {
      clearToken();
      String msg = 'Phiên đăng nhập đã hết hạn hoặc thông tin không chính xác.';
      if (decoded is Map<String, dynamic> && decoded['message'] != null) {
        msg = decoded['message'];
      }
      throw ApiException(msg, 401);
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (decoded is Map<String, dynamic>) {
        if (decoded.containsKey('success') && decoded['success'] == false) {
          throw ApiException(decoded['message'] ?? 'Thao tác không thành công', response.statusCode);
        }
        if (decoded.containsKey('data')) {
          return decoded['data'];
        }
      }
      return decoded;
    } else {
      String msg = 'Yêu cầu thất bại (${response.statusCode})';
      if (decoded is Map<String, dynamic> && decoded['message'] != null) {
        msg = decoded['message'];
      }
      throw ApiException(msg, response.statusCode);
    }
  }
}
