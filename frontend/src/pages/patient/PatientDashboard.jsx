import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import { 
  Calendar, 
  Clock, 
  Activity, 
  FileText, 
  Pill, 
  FileSearch, 
  DollarSign, 
  Stethoscope, 
  QrCode, 
  ArrowUpRight, 
  ShieldCheck, 
  Printer,
  ChevronRight,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Phone,
  User,
  HeartPulse,
  Sparkles,
  RefreshCw,
  FolderHeart
} from 'lucide-react';
import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';
import PrintTicketModal from '../../components/medical/PrintTicketModal';

const PatientDashboard = () => {
  const { user } = useAuthStore();
  const [upcomingAppt, setUpcomingAppt] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/appointments/my');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      
      // Lịch sắp tới (CONFIRMED hoặc PENDING gần nhất)
      const upcoming = list.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING') || list[0] || null;
      setUpcomingAppt(upcoming);

      // 3 lịch khám gần nhất
      setRecentAppointments(list.slice(0, 3));
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lịch hẹn:', err);
    } finally {
      setLoading(false);
    }
  };

  const qrData = upcomingAppt ? JSON.stringify({
    appointmentId: upcomingAppt.id,
    patientName: upcomingAppt.patientName || user?.fullName,
    date: upcomingAppt.appointmentDate,
    time: upcomingAppt.startTime || upcomingAppt.timeSlot,
    doctor: upcomingAppt.doctorName,
    dept: upcomingAppt.departmentName
  }) : '';

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* 1. Header Chào Mừng & Hồ Sơ Bệnh Nhân (Patient Digital ID Banner) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center flex-shrink-0 shadow-md">
            {(user?.fullName || 'BN').charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {user?.fullName || 'Bệnh nhân'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ Bệnh nhân chính thức
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>Mã bệnh nhân: <strong className="font-mono text-slate-700 font-bold">#BN-{String(user?.id || 1).padStart(6, '0')}</strong></span>
              <span>·</span>
              <span>Tài khoản: <strong className="text-slate-700 font-semibold">{user?.username}</strong></span>
              <span>·</span>
              <span>Hôm nay: <strong className="text-slate-700">{dayjs().format('dddd, DD/MM/YYYY')}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/patient/appointments"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Đặt Lịch Khám Mới</span>
          </Link>
          <Link
            to="/profile"
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs border border-slate-200 transition-all"
          >
            Hồ sơ cá nhân
          </Link>
        </div>
      </div>

      {/* 2. Vé Khám Sắp Tới Trực Tiếp (Hero Digital Ticket Pass) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <h2 className="text-sm font-black uppercase tracking-wider text-blue-300">
                Lịch Khám Sắp Tới Của Bạn
              </h2>
            </div>
            <Link
              to="/patient/appointments?tab=my"
              className="text-xs text-blue-200 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Xem tất cả vé khám</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Đang kiểm tra dữ liệu lịch hẹn...</div>
          ) : upcomingAppt ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Thông tin phiếu */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-amber-300 text-base">
                    #APPT-{String(upcomingAppt.id).padStart(5, '0')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    upcomingAppt.status === 'CONFIRMED' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' :
                    upcomingAppt.status === 'CHECKED_IN' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' :
                    'bg-amber-500/30 text-amber-200 border border-amber-400/30'
                  }`}>
                    {upcomingAppt.status === 'CONFIRMED' ? '✓ Đã xác nhận' :
                     upcomingAppt.status === 'CHECKED_IN' ? '✓ Đã tiếp nhận tại BV' : '⏳ Chờ duyệt'}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {upcomingAppt.departmentName || 'Khoa Khám Bệnh Đa Khoa'}
                  </h3>
                  <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    Bác sĩ phụ trách: <strong className="text-white font-bold">{upcomingAppt.doctorName}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Ngày hẹn khám</p>
                      <p className="font-bold text-sm text-white">{dayjs(upcomingAppt.appointmentDate).format('DD/MM/YYYY')}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Khung giờ tiếp nhận</p>
                      <p className="font-bold text-sm text-white">{upcomingAppt.startTime || upcomingAppt.timeSlot || '08:00'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedTicket(upcomingAppt)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Vé Khám Điện Tử</span>
                  </button>
                  <Link
                    to="/patient/queue"
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/15 transition-all flex items-center space-x-2"
                  >
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Theo dõi bảng số nhảy</span>
                  </Link>
                </div>
              </div>

              {/* Ô Mã QR Check-in */}
              <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-2xl shadow-lg">
                  <QRCodeSVG value={qrData} size={130} />
                </div>
                <p className="text-xs font-bold text-white mt-3">Mã QR Tiếp Nhận Tại Bệnh Viện</p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Xuất trình mã này cho nhân viên quầy tiếp nhận để lấy Số Thứ Tự tự động.
                </p>
              </div>

            </div>
          ) : (
            <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">Bạn hiện chưa có lịch khám sắp tới</p>
              <p className="text-xs text-slate-300 mt-1 mb-4">Hãy đặt lịch khám trực tuyến để được xếp số ưu tiên.</p>
              <Link
                to="/patient/appointments"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md inline-block"
              >
                Đặt Khám Bác Sĩ Ngay
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Phân Hệ Dịch Vụ Sức Khỏe (Quick Healthcare Hub) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link
          to="/patient/appointments"
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex items-start space-x-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Đặt Khám Chuyên Khoa
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Chọn khoa, bác sĩ & khung giờ khám</p>
          </div>
        </Link>

        <Link
          to="/patient/queue"
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex items-start space-x-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
              Hàng Đợi Trực Tiếp
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Xem số thứ tự đang khám tại phòng</p>
          </div>
        </Link>

        <Link
          to="/patient/prescriptions"
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex items-start space-x-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors">
              Đơn Thuốc Điện Tử
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Toa thuốc, hướng dẫn liều dùng</p>
          </div>
        </Link>

        <Link
          to="/patient/history"
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex items-start space-x-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
              Hồ Sơ & Xét Nghiệm
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Bệnh án điện tử, kết quả CLS</p>
          </div>
        </Link>

      </div>

      {/* 4. Hoạt Động Khám Gần Đây & Hướng Dẫn Y Tế */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lịch sử phiếu khám gần nhất (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Lịch Sử Phiếu Khám Gần Nhất</h3>
              <p className="text-xs text-slate-400 mt-0.5">Các lịch hẹn khám bạn đã đăng ký tại MediCare</p>
            </div>
            <Link to="/patient/appointments?tab=my" className="text-xs font-bold text-blue-600 hover:underline">
              Xem tất cả &rarr;
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Chưa có lịch sử khám bệnh
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppointments.map((appt) => (
                <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-2xl px-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{appt.departmentName || 'Khám Đa Khoa'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Bác sĩ: <span className="font-semibold text-slate-700">{appt.doctorName}</span></p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {dayjs(appt.appointmentDate).format('DD/MM/YYYY')} · {appt.startTime || appt.timeSlot || '08:00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      appt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      appt.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                      appt.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {appt.status === 'CONFIRMED' ? 'Đã duyệt' :
                       appt.status === 'COMPLETED' ? 'Đã khám' :
                       appt.status === 'CHECKED_IN' ? 'Đã tiếp nhận' : 'Chờ xác nhận'}
                    </span>
                    <button
                      onClick={() => setSelectedTicket(appt)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      Xem vé
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hướng Dẫn Đi Khám Thông Minh (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 text-xs text-slate-600 space-y-3">
            <div className="flex items-center space-x-2 font-black text-slate-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Quy Chuẩn Đi Khám Không Xếp Hàng</span>
            </div>
            <p className="leading-relaxed text-slate-500">
              1. Đến trước giờ hẹn <strong>10 phút</strong>.<br />
              2. Đưa <strong>Mã QR trên vé khám</strong> cho nhân viên quầy tiếp nhận để lấy Số Thứ Tự phòng khám.<br />
              3. Theo dõi bảng điện tử số nhảy tại cửa phòng khám tương ứng để vào khám đúng lượt.
            </p>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-slate-400 text-[11px]">Tổng đài hỗ trợ khẩn cấp:</p>
              <p className="text-blue-600 font-black text-base mt-0.5">📞 1900 1234 (Miễn phí)</p>
            </div>
          </div>
        </div>

      </div>

      {/* Modal In Vé Khám Điện Tử */}
      {selectedTicket && (
        <PrintTicketModal
          appointment={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

    </div>
  );
};

export default PatientDashboard;
