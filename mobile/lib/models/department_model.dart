class DepartmentModel {
  final int id;
  final String code;
  final String name;
  final String? description;
  final int? roomCount;

  DepartmentModel({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    this.roomCount,
  });

  factory DepartmentModel.fromJson(Map<String, dynamic> json) {
    return DepartmentModel(
      id: json['id'] as int,
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] as String?,
      roomCount: json['roomCount'] as int?,
    );
  }
}

class DoctorModel {
  final int id;
  final int? departmentId;
  final String fullName;
  final String specialization;
  final String? departmentName;
  final String? licenseNo;
  final String? status;

  DoctorModel({
    required this.id,
    this.departmentId,
    required this.fullName,
    required this.specialization,
    this.departmentName,
    this.licenseNo,
    this.status,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    return DoctorModel(
      id: json['id'] as int,
      departmentId: json['departmentId'] as int?,
      fullName: json['fullName'] ?? 'Bác sĩ',
      specialization: json['specialization'] ?? 'Chuyên khoa',
      departmentName: json['departmentName'] as String?,
      licenseNo: json['licenseNo'] as String?,
      status: json['status'] as String?,
    );
  }
}

class DoctorScheduleModel {
  final int id;
  final int doctorId;
  final String? doctorName;
  final int? roomId;
  final String? roomName;
  final String date;
  final String startTime;
  final String endTime;
  final int maxSlots;
  final int bookedSlots;
  final int availableSlots;

  DoctorScheduleModel({
    required this.id,
    required this.doctorId,
    this.doctorName,
    this.roomId,
    this.roomName,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.maxSlots,
    required this.bookedSlots,
    required this.availableSlots,
  });

  factory DoctorScheduleModel.fromJson(Map<String, dynamic> json) {
    return DoctorScheduleModel(
      id: json['id'] as int,
      doctorId: json['doctorId'] as int? ?? 0,
      doctorName: json['doctorName'] as String?,
      roomId: json['roomId'] as int?,
      roomName: json['roomName'] as String?,
      date: json['date']?.toString() ?? '',
      startTime: json['startTime']?.toString() ?? '08:00',
      endTime: json['endTime']?.toString() ?? '17:00',
      maxSlots: json['maxSlots'] as int? ?? 20,
      bookedSlots: json['bookedSlots'] as int? ?? 0,
      availableSlots: json['availableSlots'] as int? ?? 20,
    );
  }
}
