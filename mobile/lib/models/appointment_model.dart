class AppointmentModel {
  final int id;
  final String patientName;
  final String doctorName;
  final String departmentName;
  final String roomName;
  final String appointmentDate;
  final String startTime;
  final String status;
  final String? reason;
  final String? createdAt;

  AppointmentModel({
    required this.id,
    required this.patientName,
    required this.doctorName,
    required this.departmentName,
    required this.roomName,
    required this.appointmentDate,
    required this.startTime,
    required this.status,
    this.reason,
    this.createdAt,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'] as int,
      patientName: json['patientName'] ?? 'Bệnh nhân',
      doctorName: json['doctorName'] ?? 'Bác sĩ',
      departmentName: json['departmentName'] ?? 'Khoa Khám Bệnh',
      roomName: json['roomName'] ?? 'Phòng khám',
      appointmentDate: json['appointmentDate']?.toString() ?? '',
      startTime: json['startTime']?.toString() ?? '',
      status: json['status'] ?? 'PENDING',
      reason: json['reason'] as String?,
      createdAt: json['createdAt']?.toString(),
    );
  }
}

class QueueTicketModel {
  final int id;
  final String queueNumber;
  final String patientName;
  final String? patientCode;
  final String doctorName;
  final String roomName;
  final String status;
  final String? triageLevel;
  final bool? isWalkIn;
  final bool? isReturnPatient;
  final String? reason;
  final int? priorityScore;
  final int? estimatedWaitMinutes;
  final String? queueDate;
  final String? calledAt;
  final String? createdAt;

  QueueTicketModel({
    required this.id,
    required this.queueNumber,
    required this.patientName,
    this.patientCode,
    required this.doctorName,
    required this.roomName,
    required this.status,
    this.triageLevel,
    this.isWalkIn,
    this.isReturnPatient,
    this.reason,
    this.priorityScore,
    this.estimatedWaitMinutes,
    this.queueDate,
    this.calledAt,
    this.createdAt,
  });

  factory QueueTicketModel.fromJson(Map<String, dynamic> json) {
    return QueueTicketModel(
      id: json['id'] as int,
      queueNumber: json['queueNumber'] ?? '',
      patientName: json['patientName'] ?? 'Bệnh nhân',
      patientCode: json['patientCode'] as String?,
      doctorName: json['doctorName'] ?? 'Chưa phân công',
      roomName: json['roomName'] ?? 'Chưa xếp phòng',
      status: json['status'] ?? 'WAITING',
      triageLevel: json['triageLevel']?.toString(),
      isWalkIn: json['isWalkIn'] as bool?,
      isReturnPatient: json['isReturnPatient'] as bool?,
      reason: json['reason'] as String?,
      priorityScore: json['priorityScore'] as int?,
      estimatedWaitMinutes: json['estimatedWaitMinutes'] as int?,
      queueDate: json['queueDate']?.toString(),
      calledAt: json['calledAt']?.toString(),
      createdAt: json['createdAt']?.toString(),
    );
  }
}
