import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Clock, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight, 
  RefreshCw, 
  Stethoscope, 
  ArrowRight,
  TrendingUp,
  Hospital,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';

const DEPARTMENT_RADAR_DATA = [
  {
    id: 1,
    deptName: 'Khoa Nội Tổng Quát',
    room: 'Phòng R101 - R102',
    capacity: 35, // % tải
    status: 'OPTIMAL',
    statusLabel: 'Rất Thông Thoáng',
    statusBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barColor: 'from-emerald-400 to-teal-500',
    waitTime: '8 - 12 phút',
    activeDoctors: 3,
    waitingPatients: 4,
    recommendation: 'Khung giờ vàng khám ngay không cần đợi lâu.'
  },
  {
    id: 3,
    deptName: 'Khoa Tai Mũi Họng',
    room: 'Phòng R301',
    capacity: 28,
    status: 'OPTIMAL',
    statusLabel: 'Rất Thông Thoáng',
    statusBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barColor: 'from-emerald-400 to-teal-500',
    waitTime: '5 - 10 phút',
    activeDoctors: 2,
    waitingPatients: 2,
    recommendation: 'Đang có phòng trống, sẵn sàng tiếp nhận.'
  },
  {
    id: 4,
    deptName: 'Khoa Răng Hàm Mặt',
    room: 'Phòng R401',
    capacity: 52,
    status: 'MODERATE',
    statusLabel: 'Lưu Lượng Vừa Phải',
    statusBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    barColor: 'from-amber-400 to-orange-400',
    waitTime: '15 - 20 phút',
    activeDoctors: 2,
    waitingPatients: 6,
    recommendation: 'Thời gian chờ trung bình, nên đặt slot hẹn trước.'
  },
  {
    id: 2,
    deptName: 'Khoa Ngoại Tổng Quát',
    room: 'Phòng R201',
    capacity: 45,
    status: 'MODERATE',
    statusLabel: 'Lưu Lượng Vừa Phải',
    statusBadgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    barColor: 'from-blue-400 to-indigo-500',
    waitTime: '12 - 18 phút',
    activeDoctors: 2,
    waitingPatients: 5,
    recommendation: 'Bác sĩ trực ổn định, tiến độ khám nhanh.'
  },
  {
    id: 5,
    deptName: 'Khoa Mắt (Nhãn Khoa)',
    room: 'Phòng R501',
    capacity: 38,
    status: 'OPTIMAL',
    statusLabel: 'Thông Thoáng',
    statusBadgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    barColor: 'from-teal-400 to-cyan-500',
    waitTime: '10 - 15 phút',
    activeDoctors: 2,
    waitingPatients: 3,
    recommendation: 'Máy đo thị lực tự động sẵn sàng phục vụ.'
  },
  {
    id: 6,
    deptName: 'Xét Nghiệm & Cận Lâm Sàng',
    room: 'Khu Lab Tầng 2',
    capacity: 76,
    status: 'BUSY',
    statusLabel: 'Đang Cao Điểm',
    statusBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    barColor: 'from-orange-500 to-rose-500',
    waitTime: '25 - 35 phút',
    activeDoctors: 4,
    waitingPatients: 14,
    recommendation: 'Nên lấy số sớm hoặc chọn giờ chiều để trả kết quả nhanh.'
  }
];

const GOLDEN_HOURS = [
  {
    slot: '07:00 - 08:30',
    title: 'Cao Điểm Đầu Sáng',
    traffic: '85%',
    tag: 'Đông đúc',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    bar: 'bg-rose-500 w-[85%]',
    desc: 'Lượng bệnh nhân nhịn ăn xét nghiệm đông.'
  },
  {
    slot: '08:30 - 11:30',
    title: 'Ổn Định Giữa Buổi',
    traffic: '65%',
    tag: 'Trung bình',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    bar: 'bg-amber-500 w-[65%]',
    desc: 'Bác sĩ khám nhanh, thời gian chờ ~20p.'
  },
  {
    slot: '13:30 - 15:30',
    title: 'Khung Giờ Vàng ⭐',
    traffic: '30%',
    tag: 'Khuyên Dùng',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-300 font-black ring-2 ring-emerald-400/40',
    bar: 'bg-emerald-500 w-[30%]',
    desc: 'Khoa phòng vắng nhất trong ngày, khám liền!'
  },
  {
    slot: '15:30 - 17:00',
    title: 'Khám Chiều & Nhận KQ',
    traffic: '48%',
    tag: 'Khá vắng',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    bar: 'bg-blue-500 w-[48%]',
    desc: 'Rất thích hợp khám chuyên khoa và tư vấn toa thuốc.'
  },
  {
    slot: '17:00 - 20:00',
    title: 'Khám Ngoài Giờ',
    traffic: '40%',
    tag: 'Tiện lợi',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    bar: 'bg-indigo-500 w-[40%]',
    desc: 'Dành riêng cho nhân viên công sở & học sinh.'
  }
];

const HospitalLiveRadar = () => {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' or 'OPTIMAL'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Vừa xong (Real-time)');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated('Cập nhật lúc ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  };

  const displayedDepts = filterMode === 'OPTIMAL' 
    ? DEPARTMENT_RADAR_DATA.filter(d => d.capacity < 50)
    : DEPARTMENT_RADAR_DATA;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-100 space-y-8">
        
        {/* HEADER: Tiêu đề + Live indicator + Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Lưu Lượng Trực Tiếp Tại Viện · {lastUpdated}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Radar Tải Bệnh Viện & Khung Giờ Vàng Đi Khám
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Dữ liệu trực tiếp đồng bộ từ Kiosk và hệ thống gọi số phòng khám. Chủ động xem lưu lượng thực tế để chọn khoa vắng và thời điểm khám nhanh nhất.
            </p>
          </div>

          {/* Action buttons: Filter & Refresh */}
          <div className="flex items-center space-x-2.5 self-start md:self-auto flex-shrink-0">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterMode === 'ALL' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Tất Cả ({DEPARTMENT_RADAR_DATA.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('OPTIMAL')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterMode === 'OPTIMAL' ? 'bg-white text-emerald-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Khoa Rất Vắng 🟢
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              title="Làm mới trạng thái lưu lượng"
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── BENTO GRID 6 KHOA ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedDepts.map((dept) => (
            <div 
              key={dept.id}
              className="bg-slate-50/70 hover:bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header card khoa */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {dept.deptName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{dept.room}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${dept.statusBadgeColor} whitespace-nowrap`}>
                    {dept.statusLabel}
                  </span>
                </div>

                {/* Progress bar mức độ tải */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Mức độ tải hiện tại:</span>
                    <span className="font-black text-slate-800">{dept.capacity}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${dept.barColor} transition-all duration-700`}
                      style={{ width: `${dept.capacity}%` }}
                    />
                  </div>
                </div>

                {/* Metrics 3 cột: Chờ, Bác sĩ, Số người */}
                <div className="grid grid-cols-3 gap-2 py-2 bg-white rounded-2xl border border-slate-100 text-center shadow-2xs">
                  <div className="p-1.5">
                    <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Chờ
                    </div>
                    <div className="font-black text-xs text-slate-900 mt-0.5">{dept.waitTime}</div>
                  </div>
                  <div className="p-1.5 border-x border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                      <Stethoscope className="w-3 h-3 text-slate-400" /> Bác sĩ
                    </div>
                    <div className="font-black text-xs text-slate-900 mt-0.5">{dept.activeDoctors} đang trực</div>
                  </div>
                  <div className="p-1.5">
                    <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" /> Đang đợi
                    </div>
                    <div className="font-black text-xs text-slate-900 mt-0.5">{dept.waitingPatients} người</div>
                  </div>
                </div>

                {/* Gợi ý micro */}
                <p className="text-[11px] text-slate-500 italic">
                  💡 {dept.recommendation}
                </p>
              </div>

              {/* Nút đặt lịch */}
              <div className="pt-4 mt-3 border-t border-slate-100">
                <Link
                  to="/patient/appointments"
                  className="w-full py-2.5 px-4 rounded-xl bg-white group-hover:bg-blue-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-blue-600 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-2xs group-hover:shadow-md"
                >
                  <span>Đặt Lịch & Lấy Số Ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── TIMELINE KHUNG GIỜ VÀNG TRONG NGÀY ── */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Mẹo Tránh Giờ Cao Điểm · Tiết Kiệm 70% Thời Gian Chờ
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Biểu Đồ Khung Giờ Đi Khám Thông Minh Trong Ngày
              </h3>
            </div>
            <span className="text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 self-start sm:self-auto font-medium">
              📅 Áp dụng từ Thứ 2 đến Chủ Nhật
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {GOLDEN_HOURS.map((hour, idx) => (
              <div 
                key={idx}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">{hour.slot}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${hour.color}`}>
                      {hour.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-2">{hour.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{hour.desc}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span>Mức độ đông:</span>
                    <span className="font-bold text-white">{hour.traffic}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${hour.bar}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Khuyến Cáo Y Tế Thông Minh */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center flex-shrink-0 font-black text-lg">
                💡
              </div>
              <p className="text-xs text-slate-200">
                <strong className="text-cyan-300 font-bold">Khuyến cáo y tế thông minh:</strong> Để không phải chờ đợi lâu, bạn nên hoàn thành xét nghiệm trước 9h30 sáng hoặc đặt hẹn vào đầu giờ chiều từ <strong>13:30 - 15:30</strong>!
              </p>
            </div>

            <Link
              to="/patient/appointments"
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-xl transition-all flex-shrink-0 flex items-center space-x-1.5 shadow-md shadow-cyan-400/20"
            >
              <span>Chọn Giờ Khám Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HospitalLiveRadar;

