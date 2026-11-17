import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Stethoscope, 
  Search, 
  Calendar, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Filter, 
  Building2, 
  Award, 
  Clock, 
  PhoneCall, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  UserRound
} from 'lucide-react';

const DOCTOR_AVATARS = {
  1: '/images/male_doctor.jpg',
  2: '/images/female_doctor.jpg',
  3: '/images/male_doctor.jpg',
  4: '/images/male_doctor.jpg',
  5: '/images/male_doctor.jpg',
  6: '/images/female_doctor.jpg',
};

const DOCTOR_TITLES = {
  1: { title: 'Bác Sĩ Chuyên Khoa I · Trưởng Khoa Nội', exp: '16 năm kinh nghiệm', rating: '4.9', reviews: 1420 },
  2: { title: 'Thạc Sĩ Bác Sĩ · Ngoại Khoa & Phẫu Thuật', exp: '12 năm kinh nghiệm', rating: '4.95', reviews: 980 },
  3: { title: 'Bác Sĩ Chuyên Khoa I · Tai Mũi Họng', exp: '14 năm kinh nghiệm', rating: '4.88', reviews: 1150 },
  4: { title: 'Bác Sĩ Răng Hàm Mặt · Nha Khoa Thẩm Mỹ', exp: '10 năm kinh nghiệm', rating: '4.92', reviews: 860 },
  5: { title: 'Bác Sĩ Chuyên Khoa I · Nhãn Khoa & Khúc Xạ', exp: '11 năm kinh nghiệm', rating: '4.93', reviews: 740 },
  6: { title: 'Thạc Sĩ Bác Sĩ · Da Liễu & Thẩm Mỹ Nội Khoa', exp: '9 năm kinh nghiệm', rating: '4.94', reviews: 910 },
};

export default function DoctorDirectoryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(searchParams.get('deptId') || 'ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, deptsRes] = await Promise.all([
        api.get('/api/doctors'),
        api.get('/api/departments')
      ]);

      const docList = Array.isArray(docsRes) ? docsRes : (docsRes?.data || []);
      const deptList = Array.isArray(deptsRes) ? deptsRes : (deptsRes?.data || []);

      setDoctors(docList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Lỗi tải danh sách bác sĩ:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch = 
      doc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = 
      selectedDeptId === 'ALL' || 
      String(doc.departmentId) === String(selectedDeptId) ||
      (departments.find(d => String(d.id) === String(selectedDeptId))?.name === doc.departmentName);

    return matchSearch && matchDept;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* ── Banner Header ── */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-cyan-300 text-xs font-bold border border-white/15">
            <Stethoscope className="w-4 h-4 text-cyan-300" />
            <span>Đội Ngũ Chuyên Gia Y Tế Hàng Đầu · MediCare</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Đội Ngũ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-200">Bác Sĩ Chuyên Khoa</span>
          </h1>
          <p className="max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Quy tụ các bác sĩ tận tâm, giàu y đức và giàu kinh nghiệm từ các bệnh viện lớn. Người bệnh có thể chủ động chọn bác sĩ theo ý muốn và đặt lịch khám ngay không cần chờ đợi.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bác sĩ theo tên, chuyên môn (VD: Nguyễn Văn An, Nội khoa, Tai Mũi Họng...)"
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

      {/* ── Filter Tabs By Department ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-2 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedDeptId('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedDeptId === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Tất Cả Khoa
          </button>

          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(String(dept.id))}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                String(selectedDeptId) === String(dept.id)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {dept.name}
            </button>
          ))}

          <div className="ml-auto pr-3 hidden sm:block text-xs font-semibold text-slate-400">
            Hiển thị: <strong className="text-slate-700">{filteredDoctors.length}</strong> bác sĩ
          </div>
        </div>
      </div>

      {/* ── Doctor Grid ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-sm font-semibold text-slate-400">Đang tải danh sách bác sĩ...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-sm">
            <UserRound className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy bác sĩ phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Vui lòng chọn khoa khác hoặc xóa bộ lọc tìm kiếm.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedDeptId('ALL'); }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100"
            >
              Xem tất cả bác sĩ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => {
              const avatarUrl = DOCTOR_AVATARS[doc.id] || (doc.id % 2 === 0 ? '/images/female_doctor.jpg' : '/images/male_doctor.jpg');
              const extra = DOCTOR_TITLES[doc.id] || {
                title: 'Bác Sĩ Chuyên Khoa MediCare',
                exp: '10+ năm kinh nghiệm',
                rating: '4.9',
                reviews: 500
              };

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Doctor Profile Header */}
                  <div className="p-6 pb-4 flex gap-4 border-b border-slate-100">
                    <div className="relative flex-shrink-0">
                      <img
                        src={avatarUrl}
                        alt={doc.fullName}
                        className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-blue-100 shadow-sm group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/male_doctor.jpg';
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Đang nhận lịch khám" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {doc.departmentName || 'Chuyên Khoa'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Đang nhận khám
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {doc.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {extra.title}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>{extra.rating}</span>
                        </span>
                        <span className="text-slate-400">({extra.reviews} đánh giá)</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Credentials Body */}
                  <div className="p-6 py-4 flex-1 space-y-3 bg-slate-50/40 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Award size={14} className="text-blue-600 shrink-0" />
                        <span>Kinh nghiệm: <strong className="text-slate-800">{extra.exp}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Stethoscope size={14} className="text-cyan-600 shrink-0" />
                        <span>Chuyên môn: <strong className="text-slate-800">{doc.specialization}</strong></span>
                      </div>
                      {doc.licenseNo && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          <span>Số CCHN: <strong>{doc.licenseNo}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-slate-500">Giá khám tư vấn:</span>
                      <span className="text-sm font-black text-rose-600">150.000 đ</span>
                    </div>
                  </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          const deptParam = doc.departmentId ? `&deptId=${doc.departmentId}` : '';
                          navigate(`/patient/appointments?doctorId=${doc.id}${deptParam}`);
                        }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                      <Calendar size={14} />
                      <span>Đặt Khám Với Bác Sĩ</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Banner Cam Kết Y Đức ── */}
        <section className="mt-16 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-3xl relative z-10 space-y-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10">
              CAM KẾT CHẤT LƯỢNG Y TẾ
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              100% Bác Sĩ Đạt Chuẩn Chứng Chỉ Hành Nghề Bộ Y Tế
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mỗi bác sĩ tại MediCare đều tuân thủ phác đồ điều trị quốc tế, tận tâm lắng nghe, tư vấn kỹ lưỡng và giải thích rõ ràng kết quả cho từng người bệnh.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/patient/appointments"
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-colors"
              >
                <Calendar size={15} />
                <span>Đặt Lịch Khám Ngay</span>
              </Link>
              <a
                href="tel:19001234"
                className="px-5 py-2.5 bg-white/15 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-white/20 transition-colors"
              >
                <PhoneCall size={15} />
                <span>Gọi Tổng Đài: 1900 1234</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

