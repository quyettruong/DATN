import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Hospital, User, Clock, MapPin, CheckCircle, Stethoscope, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

export default function PrintQueueSlipModal({ ticket, appointment, onClose }) {
  if (!ticket && !appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const queueNo = ticket?.queueNumber || '---';
  const roomName = ticket?.roomName || appointment?.roomName || 'Phòng Khám Đa Khoa';
  const doctorName = ticket?.doctorName || appointment?.doctorName || 'Bác sĩ trực';
  const patientName = ticket?.patientName || appointment?.patientName || 'Bệnh nhân';
  const estWait = ticket?.estimatedWaitMinutes || ticket?.estimatedWaitTime || 15;
  const position = ticket?.position ?? 0;
  const createdAt = ticket?.createdAt ? dayjs(ticket.createdAt).format('HH:mm - DD/MM/YYYY') : dayjs().format('HH:mm - DD/MM/YYYY');
  const appointmentCode = appointment?.id ? `APPT-${String(appointment.id).padStart(5, '0')}` : '';

  const qrData = JSON.stringify({
    queueNumber: queueNo,
    appointmentId: appointment?.id,
    patientName,
    room: roomName
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Actions bar (hidden in print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">Phiếu Tiếp Nhận Số Thứ Tự</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt (thermal/slip style) */}
        <div className="p-8 print:p-6 bg-white" id="printable-queue-slip">
          {/* Header */}
          <div className="text-center pb-5 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-2">
              <Hospital className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Bệnh Viện Đa Khoa MediCare</h2>
            <p className="text-[11px] text-slate-500">Khu Tiếp Nhận & Điều Phối Khám Bệnh</p>
            <div className="mt-3 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider rounded-full border border-emerald-200">
              ✓ Đã Tiếp Nhận Thành Công
            </div>
          </div>

          {/* Queue Number Callout */}
          <div className="py-6 text-center border-b border-dashed border-slate-300 bg-slate-50/50 rounded-2xl my-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Số Thứ Tự Khám</span>
            <div className="text-6xl font-black text-blue-600 tracking-tighter my-2">
              {queueNo}
            </div>
            <div className="inline-flex items-center space-x-1 text-slate-700 font-bold text-base">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{roomName}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-xs text-slate-600 py-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Bệnh nhân:</span>
              <span className="font-bold text-slate-900 text-sm">{patientName}</span>
            </div>
            {appointmentCode && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mã lịch hẹn:</span>
                <span className="font-mono font-semibold text-slate-700">{appointmentCode}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Bác sĩ phụ trách:</span>
              <span className="font-semibold text-slate-800">{doctorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Giờ tiếp nhận:</span>
              <span className="font-medium text-slate-700">{createdAt}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="text-slate-400">Người chờ phía trước:</span>
              <span className="font-bold text-amber-600">{position} người</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Dự kiến gọi vào:</span>
              <span className="font-bold text-blue-600">~{estWait} phút</span>
            </div>
          </div>

          {/* QR Code Verification */}
          <div className="pt-4 flex flex-col items-center text-center">
            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
              <QRCodeSVG value={qrData} size={96} level="M" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">Quét mã kiểm tra số lượt tự động</p>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-200 text-center">
            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
              Quý khách vui lòng theo dõi bảng điện tử số nhảy tại cửa phòng khám. Xin cảm ơn!
            </p>
          </div>
        </div>

        {/* Modal actions footer (print:hidden) */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>In Phiếu Khám</span>
          </button>
        </div>

      </div>
    </div>
  );
}

