import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Building2, 
  Stethoscope, 
  Search, 
  Calendar, 
  Users, 
  ArrowRight, 
  DoorOpen, 
  Activity, 
  Heart, 
  Eye, 
  Smile, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  PhoneCall
} from 'lucide-react';

const DEPARTMENT_METADATA = {
  NOI: {
    icon: Heart,
    color: 'from-blue-600 to-cyan-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    popularConditions: ['Tăng huyết áp, tim mạch', 'Đái tháo đường, rối loạn mỡ máu', 'Bệnh lý dạ dày, tiêu hóa', 'Viêm phế quản, hen suyễn'],
    featuredRooms: ['Phòng 101 - Khám Nội Tổng Quát', 'Phòng 102 - Khám Tim Mạch & Huyết Áp'],
    workingHours: 'Thứ 2 - Thứ 7: 07:00 - 17:30'
  },
  NGOAI: {
    icon: Activity,
    color: 'from-emerald-600 to-teal-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    popularConditions: ['Chấn thương phần mềm & xương khớp', 'Tiểu phẫu u bã đậu, mụn nhọt', 'Bệnh lý trĩ & hậu môn trực tràng', 'Tầm soát ngoại khoa tổng quát'],
    featuredRooms: ['Phòng 201 - Khám Ngoại Tổng Quát', 'Phòng 202 - Tiểu Phẫu & Bó Bột'],
    workingHours: 'Thứ 2 - Thứ 7: 07:00 - 17:30'
  },
  TMH: {
    icon: Stethoscope,
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    popularConditions: ['Viêm họng hạt, viêm amidan mạn', 'Viêm xoang cấp & mạn tính', 'Ù tai, giảm thính lực, viêm tai giữa', 'Nội soi tầm soát vòm họng ống mềm'],
    featuredRooms: ['Phòng 301 - Khám Tai Mũi Họng', 'Phòng 302 - Nội Soi TMH Ống Mềm'],
    workingHours: 'Thứ 2 - Chủ nhật: 07:00 - 17:00'
  },
  RHM: {
    icon: Smile,
    color: 'from-indigo-600 to-purple-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    popularConditions: ['Khám & điều trị sâu răng, tủy răng', 'Nhổ răng khôn không đau', 'Lấy cao răng & đánh bóng công nghệ siêu âm', 'Chỉnh nha & phục hình răng sứ'],
    featuredRooms: ['Phòng 401 - Khám & Chữa Răng', 'Phòng 402 - Nha Khoa Thẩm Mỹ'],
    workingHours: 'Thứ 2 - Thứ 7: 07:30 - 18:00'
  },
  MAT: {
    icon: Eye,
    color: 'from-sky-600 to-blue-700',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    popularConditions: ['Đo khúc xạ, cận thị, viễn thị, loạn thị', 'Viêm kết mạc, đau mắt đỏ', 'Tầm soát đục thủy tinh thể & cườm nước', 'Khám đáy mắt & tổn thương giác mạc'],
    featuredRooms: ['Phòng 501 - Khám Mắt & Khúc Xạ', 'Phòng 502 - Đo Thị Lực Điện Tử'],
    workingHours: 'Thứ 2 - Thứ 7: 07:30 - 17:00'
  },
  DA: {
    icon: Sparkles,
    color: 'from-rose-500 to-pink-600',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    popularConditions: ['Viêm da cơ địa, dị ứng, mề đay', 'Mụn trứng cá, thâm sẹo sau mụn', 'Nấm da, chàm, vảy nến', 'Khám & soi da vi thể chuyên sâu'],
    featuredRooms: ['Phòng 601 - Khám Da Liễu', 'Phòng 602 - Chăm Sóc & Laser Da'],
    workingHours: 'Thứ 2 - Thứ 7: 07:30 - 17:00'
  }
};

export default function SpecialtiesPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/departments');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setDepartments(list);
    } catch (err) {
      console.error('Lỗi khi tải chuyên khoa:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepts = departments.filter((dept) => {
    const code = dept.code || '';
    const meta = DEPARTMENT_METADATA[code] || {};
    const matchSearch = 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (meta.popularConditions && meta.popularConditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())));

    if (selectedFilter === 'ALL') return matchSearch;
    if (selectedFilter === 'NOI' && (code === 'NOI' || code === 'NHI')) return matchSearch;
    if (selectedFilter === 'NGOAI' && (code === 'NGOAI' || code === 'RHM')) return matchSearch;
    if (selectedFilter === 'SPECIAL' && (code === 'TMH' || code === 'MAT' || code === 'DA')) return matchSearch;
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* ── Banner Header ── */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-cyan-300 text-xs font-bold border border-white/15">
            <Building2 className="w-4 h-4 text-cyan-300" />
            <span>Hệ Thống Y Tế MediCare · Chuẩn Mực Quốc Tế</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Danh Sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-200">Chuyên Khoa Khám Bệnh</span>
          </h1>
          <p className="max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Hệ thống quy tụ các chuyên khoa mũi nhọn với trang thiết bị chẩn đoán công nghệ cao. Bạn có thể dễ dàng tra cứu thông tin chuyên khoa, danh mục phòng khám và đặt lịch khám đích danh.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm nhanh chuyên khoa, triệu chứng (VD: Tim mạch, họng, mắt, sâu răng, da liễu...)"
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-2xl shadow-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter Tabs ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-2 flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'Tất Cả Chuyên Khoa' },
            { id: 'NOI', label: 'Hệ Khối Nội' },
            { id: 'NGOAI', label: 'Hệ Khối Ngoại' },
            { id: 'SPECIAL', label: 'Chuyên Khoa Lẻ (TMH, Mắt, Da)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto pr-3 hidden sm:block text-xs font-semibold text-slate-400">
            Hiển thị: <strong className="text-slate-700">{filteredDepts.length}</strong> chuyên khoa
          </div>
        </div>
      </div>

      {/* ── Department Grid ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-sm font-semibold text-slate-400">Đang tải danh sách chuyên khoa...</p>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-sm">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy chuyên khoa phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Vui lòng thử tìm với từ khóa khác như "Nội", "Ngoại", "Mắt", "Răng"...</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedFilter('ALL'); }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100"
            >
              Xem tất cả chuyên khoa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepts.map((dept) => {
              const meta = DEPARTMENT_METADATA[dept.code] || {
                icon: Stethoscope,
                color: 'from-blue-600 to-indigo-600',
                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
                popularConditions: ['Khám chẩn đoán chuyên khoa tổng quát', 'Điều trị nội trú và ngoại trú'],
                featuredRooms: [`Khu khám ${dept.name}`],
                workingHours: 'Thứ 2 - Thứ 7: 07:00 - 17:30'
              };
              const IconComp = meta.icon;

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 border-b border-slate-100 flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-md shadow-blue-500/10 flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <IconComp className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${meta.badgeColor}`}>
                          MÃ: {dept.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <DoorOpen size={12} /> {dept.roomCount || 2} phòng khám
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {dept.description || 'Khoa khám và điều trị chất lượng cao'}
                      </p>
                    </div>
                  </div>

                  {/* Card Body: Conditions treated */}
                  <div className="p-6 py-4 flex-1 space-y-3.5 bg-slate-50/40">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        Bệnh lý & Triệu chứng tiếp nhận:
                      </p>
                      <ul className="space-y-1.5">
                        {(meta.popularConditions || []).map((cond, idx) => (
                          <li key={idx} className="text-xs font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="line-clamp-1">{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> {meta.workingHours}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/doctors?deptId=${dept.id}`)}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Users size={14} className="text-slate-500" />
                      <span>Xem Bác Sĩ</span>
                    </button>
                    <button
                      onClick={() => navigate(`/patient/appointments?deptId=${dept.id}`)}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar size={14} />
                      <span>Đặt Khám</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Quy Trình 4 Bước Đặt Khám Chuyên Khoa ── */}
        <section className="mt-16 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              HƯỚNG DẪN TIỆN ÍCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Quy Trình Khám Chuyên Khoa Nhanh Chóng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              MediCare tối ưu quy trình để người bệnh không mất thời gian chờ đợi lấy số giấy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Chọn Chuyên Khoa',
                desc: 'Tra cứu khoa điều trị phù hợp với tình trạng hoặc triệu chứng của bạn.'
              },
              {
                step: '02',
                title: 'Chọn Bác Sĩ & Giờ',
                desc: 'Chủ động lựa chọn bác sĩ khám và khung giờ linh hoạt phù hợp lịch cá nhân.'
              },
              {
                step: '03',
                title: 'Nhận Phiếu Khám QR',
                desc: 'Hệ thống gửi mã QR vé khám điện tử ngay trên điện thoại của bạn.'
              },
              {
                step: '04',
                title: 'Vào Khám Trực Tiếp',
                desc: 'Đến đúng phòng khám ưu tiên, quét mã QR vào thẳng gặp bác sĩ.'
              }
            ].map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 relative">
                <span className="text-2xl font-black text-blue-600/30 block leading-none">{st.step}</span>
                <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <PhoneCall size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cần tư vấn chọn chuyên khoa tiếp nhận?</p>
                <p className="text-sm font-black text-rose-600">Tổng đài y tế: 1900 1234 (24/7)</p>
              </div>
            </div>
            <Link
              to="/patient/appointments"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Calendar size={15} />
              <span>Đặt Khám Chuyên Khoa Ngay</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

