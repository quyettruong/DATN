import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null && _user != null;

  AuthProvider() {
    loadUserFromStorage();
  }

  Future<void> loadUserFromStorage() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('jwt_token');
      final userDataStr = prefs.getString('user_data');

      if (_token != null && userDataStr != null) {
        _user = UserModel.fromJson(jsonDecode(userDataStr));
        // Refresh latest profile from server
        await refreshProfile();
      }
    } catch (_) {
      await logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post('/auth/login', {
        'username': username.trim(),
        'password': password.trim(),
      });

      if (res is Map<String, dynamic>) {
        _token = res['token'];
        if (_token != null) {
          await ApiService.setToken(_token!);
          // Fetch full user profile
          await refreshProfile();
          return true;
        }
      }
      _errorMessage = 'Dữ liệu đăng nhập không hợp lệ';
      return false;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register({
    required String username,
    required String password,
    required String fullName,
    String? phone,
    String? email,
    String? gender,
    String? dob,
    String? address,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await ApiService.post('/auth/register', {
        'username': username.trim(),
        'password': password.trim(),
        'fullName': fullName.trim(),
        'phone': phone?.trim() ?? '',
        'email': email?.trim() ?? '',
        'gender': gender ?? 'OTHER',
        if (dob != null && dob.isNotEmpty) 'dob': dob,
        'address': address?.trim() ?? '',
      });
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshProfile() async {
    try {
      final res = await ApiService.get('/users/me');
      if (res is Map<String, dynamic>) {
        _user = UserModel.fromJson(res);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> updateProfile(Map<String, String> updates) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService.put('/users/me', updates);
      if (res is Map<String, dynamic>) {
        _user = UserModel.fromJson(res);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    await ApiService.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
    notifyListeners();
  }
}
