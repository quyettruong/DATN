import React from 'react';
import { Printer, X, Hospital, Pill, Stethoscope, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function PrintPrescriptionModal({ prescription, exam, onClose }) {
  if (!prescription && !exam) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName = exam?.patientName || prescription?.patientName || 'Bệnh nhân';
  const patientCode = exam?.patientCode || prescription?.patientCode || 'BN-0000';
  const patientAllergies = exam?.patientAllergies || prescription?.patientAllergies || '';
  const patientBloodType = exam?.patientBloodType || prescription?.patientBloodType || '';
  const doctorName = exam?.doctorName || prescription?.doctorName || 'Bác sĩ điều trị';
  const diagnosis = exam?.diagnosis || prescription?.diagnosis || 'Chưa ghi nhận chẩn đoán';
  const symptoms = exam?.symptoms || '';
  const notes = exam?.notes || exam?.conclusion || prescription?.notes || 'Tuân thủ đúng liều lượng, tái khám nếu có dấu hiệu bất thường.';
  const items = prescription?.items || prescription?.prescriptionItems || [];
  const prescId = prescription?.id || exam?.id || Date.now().toString().slice(-6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm tracking-wide">Đơn Thuốc Điện Tử Chuẩn Bộ Y Tế</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Đơn Thuốc</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Sheet (A4 clean ratio) */}
        <div className="p-8 sm:p-10 bg-white text-slate-900 text-sm" id="printable-prescription">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sở Y Tế TP. Hồ Chí Minh</p>
              <h1 className="text-lg font-black text-slate-900 uppercase">Bệnh Viện Đa Khoa MediCare</h1>
              <p className="text-xs text-slate-500 mt-0.5">Khoa Khám Bệnh Ngoại Trú</p>
              <p className="text-xs text-slate-400">123 Đường Sức Khỏe, Q.1, TP.HCM · ĐT: (028) 3822 9999</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase">Mã đơn thuốc:</p>
              <p className="font-mono text-base font-black text-blue-700">#RX-{prescId.toString().padStart(6, '0')}</p>
              <p className="text-xs text-slate-400 mt-1">{dayjs().format('DD/MM/YYYY HH:mm')}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900">Đơn Thuốc</h2>
            <p className="text-xs text-slate-500 italic mt-0.5">(Khám bệnh ngoại trú)</p>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 mb-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Họ và tên:</span>{' '}
                <span className="font-black text-slate-900 uppercase">{patientName}</span>
              </div>
              <div className="text-right sm:text-left">
                <span className="text-slate-500">Mã bệnh nhân:</span>{' '}
                <span className="font-mono font-bold text-slate-800">{patientCode}</span>
                {patientBloodType && (
                  <span className="ml-2 font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-xs">
                    Nhóm máu: {patientBloodType}
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Tiền sử dị ứng:</span>{' '}
              <span className={`font-semibold ${
                patientAllergies && !patientAllergies.toLowerCase().includes('không') && !patientAllergies.toLowerCase().includes('chưa')
                  ? 'text-red-600 font-bold' : 'text-slate-600'
              }`}>
                {patientAllergies || 'Không ghi nhận tiền sử dị ứng thuốc'}
              </span>
            </div>
            {symptoms && (
              <div>
                <span className="text-slate-500">Triệu chứng ban đầu:</span>{' '}
                <span className="text-slate-700">{symptoms}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">Chẩn đoán:</span>{' '}
              <span className="font-bold text-rose-700">{diagnosis}</span>
            </div>
          </div>

          {/* Medication Table */}
          <div className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-600" /> Danh mục thuốc điều trị:
            </h3>
            
            {items.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">STT</th>
                      <th className="py-2.5 px-3 text-left">Tên thuốc & Hàm lượng</th>
                      <th className="py-2.5 px-3 text-center w-16">SL</th>
                      <th className="py-2.5 px-3 text-left">Cách dùng & Liều lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">
                            {item.medicationName || item.medication?.name || item.name || `Thuốc #${item.medicationId}`}
                          </p>
                          {item.dosage && <p className="text-xs text-slate-500">Liều: {item.dosage}</p>}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {item.quantity || 1}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <p className="font-medium">{item.instruction || item.frequency || 'Theo chỉ dẫn của bác sĩ'}</p>
                          {item.duration && <p className="text-xs text-slate-400">Dùng trong {item.duration} ngày</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                Chưa có danh mục thuốc được thêm vào đơn này.
              </div>
            )}
          </div>

          {/* Doctor advice */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900 mb-8">
            <span className="font-bold text-amber-800">Lời dặn của bác sĩ:</span> {notes}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center pt-2">
            <div>
              <p className="font-bold text-xs uppercase text-slate-500">Người nhận thuốc</p>
              <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="text-xs text-slate-600 font-medium">{patientName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 italic">Ngày {dayjs().format('DD')} tháng {dayjs().format('MM')} năm {dayjs().format('YYYY')}</p>
              <p className="font-bold text-xs uppercase text-slate-800 mt-1">Bác sĩ khám bệnh</p>
              <div className="h-14 flex items-center justify-center">
                <span className="font-serif italic text-blue-600/70 text-base">{doctorName}</span>
              </div>
              <p className="text-xs font-bold text-slate-900">{doctorName}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

