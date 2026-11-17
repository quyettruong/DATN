class PrescriptionItemModel {
  final int? id;
  final int? medicationId;
  final String medicationName;
  final String? dosageForm;
  final String? dosage;
  final String? frequency;
  final String? duration;
  final int quantity;
  final String? instruction;

  PrescriptionItemModel({
    this.id,
    this.medicationId,
    required this.medicationName,
    this.dosageForm,
    this.dosage,
    this.frequency,
    this.duration,
    required this.quantity,
    this.instruction,
  });

  factory PrescriptionItemModel.fromJson(Map<String, dynamic> json) {
    return PrescriptionItemModel(
      id: json['id'] as int?,
      medicationId: json['medicationId'] as int?,
      medicationName: json['medicationName'] ?? 'Thuốc',
      dosageForm: json['dosageForm'] as String?,
      dosage: json['dosage'] as String?,
      frequency: json['frequency'] as String?,
      duration: json['duration'] as String?,
      quantity: json['quantity'] as int? ?? 1,
      instruction: json['instruction'] as String?,
    );
  }
}

class PrescriptionModel {
  final int id;
  final int? examinationId;
  final String doctorName;
  final String patientName;
  final String? patientCode;
  final String? patientAllergies;
  final String? diagnosis;
  final String? notes;
  final String status;
  final List<PrescriptionItemModel> items;
  final String? prescribedAt;

  PrescriptionModel({
    required this.id,
    this.examinationId,
    required this.doctorName,
    required this.patientName,
    this.patientCode,
    this.patientAllergies,
    this.diagnosis,
    this.notes,
    required this.status,
    required this.items,
    this.prescribedAt,
  });

  factory PrescriptionModel.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List<dynamic>? ?? [];
    List<PrescriptionItemModel> parsedItems = rawItems
        .map((i) => PrescriptionItemModel.fromJson(i as Map<String, dynamic>))
        .toList();

    return PrescriptionModel(
      id: json['id'] as int,
      examinationId: json['examinationId'] as int?,
      doctorName: json['doctorName'] ?? 'Bác sĩ điều trị',
      patientName: json['patientName'] ?? 'Bệnh nhân',
      patientCode: json['patientCode'] as String?,
      patientAllergies: json['patientAllergies'] as String?,
      diagnosis: json['diagnosis'] as String?,
      notes: json['notes'] as String?,
      status: json['status'] ?? 'ACTIVE',
      items: parsedItems,
      prescribedAt: json['prescribedAt']?.toString(),
    );
  }
}

class InvoiceItemModel {
  final String itemName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final String? itemType;

  InvoiceItemModel({
    required this.itemName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.itemType,
  });

  factory InvoiceItemModel.fromJson(Map<String, dynamic> json) {
    return InvoiceItemModel(
      itemName: json['itemName'] ?? 'Dịch vụ y tế',
      quantity: json['quantity'] as int? ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      itemType: json['itemType'] as String?,
    );
  }
}

class InvoiceModel {
  final int id;
  final String invoiceNumber;
  final String patientName;
  final String? patientCode;
  final double consultationFee;
  final double labFee;
  final double medicationFee;
  final double discountAmount;
  final double totalAmount;
  final double paidAmount;
  final double remainingAmount;
  final String status;
  final String? paymentMethod;
  final String? createdAt;
  final List<InvoiceItemModel> items;

  InvoiceModel({
    required this.id,
    required this.invoiceNumber,
    required this.patientName,
    this.patientCode,
    required this.consultationFee,
    required this.labFee,
    required this.medicationFee,
    required this.discountAmount,
    required this.totalAmount,
    required this.paidAmount,
    required this.remainingAmount,
    required this.status,
    this.paymentMethod,
    this.createdAt,
    required this.items,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List<dynamic>? ?? [];
    List<InvoiceItemModel> parsedItems = rawItems
        .map((i) => InvoiceItemModel.fromJson(i as Map<String, dynamic>))
        .toList();

    return InvoiceModel(
      id: json['id'] as int,
      invoiceNumber: json['invoiceNumber'] ?? '',
      patientName: json['patientName'] ?? 'Bệnh nhân',
      patientCode: json['patientCode'] as String?,
      consultationFee: (json['consultationFee'] as num?)?.toDouble() ?? 0.0,
      labFee: (json['labFee'] as num?)?.toDouble() ?? 0.0,
      medicationFee: (json['medicationFee'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      paidAmount: (json['paidAmount'] as num?)?.toDouble() ?? 0.0,
      remainingAmount: (json['remainingAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'UNPAID',
      paymentMethod: json['paymentMethod'] as String?,
      createdAt: json['createdAt']?.toString(),
      items: parsedItems,
    );
  }
}
