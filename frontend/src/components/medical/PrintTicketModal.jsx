import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Hospital, Calendar, Clock, User, CheckCircle2, MapPin } from 'lucide-react';
import dayjs from 'dayjs';

export default function PrintTicketModal({ appointment, onClose }) {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const ticketData = JSON.stringify({
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    date: appointment.appointmentDate,
    time: appointment.startTime || appointment.timeSlot,
    doctor: appointment.doctorName,
    dept: appointment.departmentName,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Actions bar (hidden during print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">Vé Đặt Khám Điện Tử</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
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

        {/* Printable Pass Content */}
        <div className="p-8 print:p-0 bg-white" id="printable-ticket">
          {/* Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-2">
              <Hospital className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">Bệnh Viện Đa Khoa MediCare</h2>
            <p className="text-xs text-slate-500 mt-0.5">Số 123 Đường Sức Khỏe, Quận 1, TP. Hồ Chí Minh · Hotline: 1900 1234</p>
            <div className="inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs uppercase tracking-widest rounded-full">
              Phiếu Đặt Lịch Khám Bệnh
            </div>
          </div>

          {/* Ticket ID & QR Code */}
          <div className="py-6 flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl my-5 border border-slate-100">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80">
              <QRCodeSVG
                value={ticketData}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="font-mono text-base font-extrabold text-slate-800 tracking-wider mt-3">
              #APPT-{(appointment.id || '').toString().padStart(5, '0')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Quét mã này tại Kiosk hoặc Quầy tiếp nhận</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> Bệnh nhân:
              </span>
              <span className="font-bold text-slate-900">{appointment.patientName || 'Quý khách'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Hospital className="w-4 h-4 text-slate-400" /> Chuyên khoa:
              </span>
              <span className="font-semibold text-slate-800">{appointment.departmentName || 'Khoa Khám Bệnh'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> Bác sĩ phụ trách:
              </span>
              <span className="font-semibold text-blue-700">{appointment.doctorName || 'Bác sĩ chuyên khoa'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> Ngày khám:
              </span>
              <span className="font-bold text-slate-900">{dayjs(appointment.appointmentDate).format('DD/MM/YYYY')}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> Khung giờ:
              </span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                {appointment.startTime || appointment.timeSlot || 'Theo lịch hẹn'}
              </span>
            </div>

            {appointment.roomName && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> Phòng khám:
                </span>
                <span className="font-bold text-slate-900">{appointment.roomName}</span>
              </div>
            )}
          </div>

          {/* Instructions Notice */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1 text-amber-800">
              📌 Hướng dẫn khi đến khám:
            </p>
            <p>1. Vui lòng có mặt tại bệnh viện trước <strong>15 phút</strong> so với khung giờ hẹn.</p>
            <p>2. Đưa mã QR trên phiếu này vào máy quét tại <strong>Quầy tiếp nhận tự động</strong> để lấy số thứ tự ưu tiên.</p>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 mt-5 pt-3 border-t border-slate-100">
            Vé khám điện tử có hiệu lực trong ngày đăng ký · In lúc {dayjs().format('HH:mm - DD/MM/YYYY')}
          </div>
        </div>

      </div>
    </div>
  );
}

