class UserModel {
  final int? id;
  final String username;
  final String fullName;
  final String? email;
  final String? phone;
  final String role;
  final String? patientCode;
  final String? dob;
  final String? gender;
  final String? address;
  final String? allergies;
  final String? medicalHistory;
  final String? bloodType;

  UserModel({
    this.id,
    required this.username,
    required this.fullName,
    this.email,
    this.phone,
    required this.role,
    this.patientCode,
    this.dob,
    this.gender,
    this.address,
    this.allergies,
    this.medicalHistory,
    this.bloodType,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int?,
      username: json['username'] ?? '',
      fullName: json['fullName'] ?? 'Người dùng',
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      role: json['role'] ?? 'PATIENT',
      patientCode: json['patientCode'] as String?,
      dob: json['dob']?.toString(),
      gender: json['gender'] as String?,
      address: json['address'] as String?,
      allergies: json['allergies'] as String?,
      medicalHistory: json['medicalHistory'] as String?,
      bloodType: json['bloodType'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'role': role,
      'patientCode': patientCode,
      'dob': dob,
      'gender': gender,
      'address': address,
      'allergies': allergies,
      'medicalHistory': medicalHistory,
      'bloodType': bloodType,
    };
  }
}
