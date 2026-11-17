import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import MobileAppShowcase from '../../components/home/MobileAppShowcase';
import ClinicalSymptomNavigator from '../../components/home/ClinicalSymptomNavigator';
import HospitalLiveRadar from '../../components/home/HospitalLiveRadar';
import DigitalHealthPass from '../../components/home/DigitalHealthPass';
import { 
  Search, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Video, 
  FlaskConical, 
  HeartPulse, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Hospital, 
  Activity, 
  Smile, 
  Eye, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  Award,
  Users,
  MapPin,
  Star,
  FileText,
  Clock4,
  HeartHandshake
} from 'lucide-react';

const FEATURED_SERVICES = [
  {
    id: 'dept',
    title: 'Đặt khám chuyên khoa',
    desc: 'Khoa Nội, Ngoại, Nhi, Mắt...',
    icon: Stethoscope,
    badge: 'Phổ biến',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    link: '/specialties'
  },
  {
    id: 'doctors',
    title: 'Đội ngũ bác sĩ',
    desc: 'Bác sĩ chuyên khoa đầu ngành',
    icon: Users,
    badge: 'Chuyên gia',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    link: '/doctors'
  },
  {
    id: 'facility',
    title: 'Đặt khám tại cơ sở',
    desc: 'Bệnh viện & Phòng khám',
    icon: Hospital,
    badge: 'Nổi bật',
    color: 'text-teal-600 bg-teal-50 border-teal-100',
    link: '/patient/appointments'
  },
  /* [Tạm thời comment chức năng gọi video với bác sĩ]
  {
    id: 'telehealth',
    title: 'Gọi video với bác sĩ',
    desc: 'Tư vấn sức khỏe từ xa 24/7',
    icon: Video,
    badge: 'Mới',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    link: '/patient/appointments'
  },
  */
  {
    id: 'lab',
    title: 'Đặt lịch xét nghiệm',
    desc: 'Máu, nước tiểu, sinh hóa...',
    icon: FlaskConical,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    link: '/patient/history'
  },
  {
    id: 'after-hours',
    title: 'Đặt khám ngoài giờ',
    desc: 'Khám tối & Thứ 7, Chủ Nhật',
    icon: Clock4,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    link: '/patient/appointments'
  },
  {
    id: 'companion',
    title: 'Giúp việc cá nhân',
    desc: 'Hỗ trợ người già, đưa đón',
    icon: HeartHandshake,
    badge: 'Mới',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    link: '/patient/appointments'
  },
  {
    id: 'checkup',
    title: 'Khám sức khỏe thông tư',
    desc: 'Khám định kỳ & Doanh nghiệp',
    icon: FileText,
    color: 'text-purple-600 bg-purple-50 border-purple-100',
    link: '/patient/appointments'
  }
];

const QUICK_SEARCH_CHIPS = [
  'Khoa Nội Tổng Quát',
  'Tai Mũi Họng',
  'Răng Hàm Mặt',
  'Khám Nhi Khoa',
  'Khám Tổng Quát',
  'Nội Soi Dạ Dày',
  'Đo Thị Lực'
];

const FEATURED_HOSPITALS = [
  {
    name: 'Bệnh viện Đa khoa Quốc tế Vinmec',
    tagline: 'Quốc tế 5 sao · Chuẩn JCI Hoa Kỳ',
    address: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
    rating: 5.0,
    reviews: 1420,
    specialties: 'Đa khoa, Tim mạch, Sản nhi, Ngoại khoa',
    badge: 'Quốc Tế'
  },
  {
    name: 'Bệnh viện Đa khoa Phương Đông',
    tagline: 'Bệnh viện Xanh · Cơ sở vật chất 5 sao',
    address: 'Bắc Từ Liêm, Hà Nội',
    rating: 4.9,
    reviews: 980,
    specialties: 'Khám tổng quát, Tai mũi họng, Tiêu hóa',
    badge: 'Uy Tín'
  },
  {
    name: 'Trung tâm Y tế Quốc tế DYM Medical',
    tagline: 'Công nghệ Y tế Tiêu chuẩn Nhật Bản',
    address: 'Quận 1, TP. Hồ Chí Minh',
    rating: 5.0,
    reviews: 650,
    specialties: 'Nội soi không đau, Tầm soát sức khỏe',
    badge: 'Nhật Bản'
  },
  {
    name: 'Nha Khoa Quốc Tế Aura Dental',
    tagline: 'Nha khoa Kỹ thuật số Không đau 4.0',
    address: 'Quận 10, TP. Hồ Chí Minh',
    rating: 4.9,
    reviews: 820,
    specialties: 'Răng hàm mặt, Trồng răng Implant, Niềng răng',
    badge: 'Chuyên Sâu'
  }
];

const PARTNERS = [
  'DYM Medical Center',
  'Bệnh viện Phương Nam',
  'Dr.Marie Clinic',
  'BV Quốc Tế Nam Sài Gòn',
  'BV Quốc Tế Sài Gòn (SIG)',
  'Bệnh viện Hưng Việt',
  'Hệ thống Vinmec Central Park'
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/doctors');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setDoctors(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/patient/appointments?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/patient/appointments');
    }
  };

  const handleChipClick = (keyword) => {
    setSearchTerm(keyword);
    navigate(`/patient/appointments?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="space-y-16">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER SECTION VỚI 2 BÁC SĨ 2 BÊN CHUẨN MEDPRO                    */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-sky-100 via-blue-50/60 to-white pt-10 pb-20 px-4 sm:px-6 overflow-hidden border-b border-blue-100/70">
        
        {/* Glow ambient background circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Bác Sĩ Nữ Bên Trái (Desktop only) */}
          <div className="hidden lg:flex w-64 xl:w-72 flex-col items-center justify-end relative flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl transform -rotate-3 scale-95 group-hover:scale-100 transition-transform" />
              <img
                src="/images/female_doctor.jpg"
                alt="Bác sĩ nữ MediCare"
                className="relative z-10 w-full h-80 xl:h-96 object-cover object-top rounded-3xl shadow-xl shadow-blue-500/15 border-2 border-white/80"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-100 text-center">
                <p className="text-xs font-black text-slate-900">ThS.BS. Hoàng Mai Anh</p>
                <p className="text-[10px] text-blue-600 font-bold">Chuyên Khoa Nhi & Dinh Dưỡng</p>
              </div>
            </div>
          </div>

          {/* Nội Dung Trung Tâm (Headline, Big Search Bar, Cam kết) */}
          <div className="flex-1 text-center max-w-2xl mx-auto space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-100/80 border border-blue-200/80 rounded-full text-blue-800 text-xs font-bold shadow-xs">
              <HeartPulse className="w-4 h-4 text-blue-600" />
              <span>Hệ Thống Y Tế Số & Tiếp Nhận Khám Chữa Bệnh Thông Minh</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Kết nối Người Dân với Cơ sở & Dịch vụ Y tế hàng đầu
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Đặt khám nhanh chóng, lấy số thứ tự trực tuyến, nhận vé điện tử có mã QR và vào thẳng phòng khám không cần xếp hàng lấy số giấy.
            </p>

            {/* Big Search Bar (Medpro style) */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl mx-auto">
              <div className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl shadow-blue-500/15 border-2 border-blue-200 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center flex-1 w-full pl-3">
                  <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm chuyên khoa, bác sĩ, triệu chứng bệnh..."
                    className="w-full px-3 py-2.5 text-xs sm:text-sm outline-none text-slate-800 placeholder-slate-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-full font-black text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 flex-shrink-0"
                >
                  <span>Tìm Kiếm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Gợi ý từ khóa tìm kiếm nhanh dạng Chip */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400">Gợi ý nhanh:</span>
              {QUICK_SEARCH_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full text-[11px] font-semibold border border-slate-200/80 shadow-xs transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* 3 Cam kết có tích xanh (Check badges) */}
            <div className="pt-4 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-slate-700 font-bold">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Đặt khám nhanh – Lấy số thứ tự trực tuyến</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Đặt khám theo giờ – Đến đúng giờ là được khám</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Vé khám QR – Tiếp nhận ưu tiên tại bệnh viện</span>
              </div>
            </div>

          </div>

          {/* Bác Sĩ Nam Bên Phải (Desktop only) */}
          <div className="hidden lg:flex w-64 xl:w-72 flex-col items-center justify-end relative flex-shrink-0 animate-in fade-in slide-in-from-right duration-500">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-2xl transform rotate-3 scale-95 group-hover:scale-100 transition-transform" />
              <img
                src="/images/male_doctor.jpg"
                alt="Bác sĩ nam MediCare"
                className="relative z-10 w-full h-80 xl:h-96 object-cover object-top rounded-3xl shadow-xl shadow-indigo-500/15 border-2 border-white/80"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-100 text-center">
                <p className="text-xs font-black text-slate-900">BS. CKI Trần Văn Nam</p>
                <p className="text-[10px] text-indigo-600 font-bold">Chuyên Khoa Tim Mạch & Nội Khoa</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HÀNG 7 THẺ DỊCH VỤ Y TẾ NỔI BẬT (QUICK SERVICES GRID)                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-14 relative z-20">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {FEATURED_SERVICES.map((serv) => {
              const IconComp = serv.icon;
              return (
                <Link
                  key={serv.id}
                  to={serv.link}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-between group relative overflow-hidden bg-white"
                >
                  {serv.badge && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase">
                      {serv.badge}
                    </span>
                  )}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${serv.color}`}>
                    <IconComp className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs group-hover:text-blue-600 transition-colors">
                      {serv.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{serv.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.1 ĐỊNH HƯỚNG & PHÂN LUỒNG TRIỆU CHỨNG KHÁM CHUYÊN KHOA                  */}
      {/* ========================================================================= */}
      <div id="symptom-navigator">
        <ClinicalSymptomNavigator />
      </div>

      {/* ========================================================================= */}
      {/* 2.2 RADAR TẢI BỆNH VIỆN THỜI GIAN THỰC & KHUNG GIỜ VÀNG (HOSPITAL RADAR)  */}
      {/* ========================================================================= */}
      <HospitalLiveRadar />

      {/* ========================================================================= */}
      {/* 3. DẢI SỐ LIỆU Y TẾ ẤN TƯỢNG (MEDPRO IMPACT STATS)                        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-cyan-300 tracking-tight">4.200.000+</p>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Lượt đặt khám thành công</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">120+</p>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Bệnh viện & cơ sở y tế kết nối</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">1.500+</p>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Bác sĩ chuyên khoa đầu ngành</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-rose-300 tracking-tight">98.9%</p>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Người bệnh hài lòng tuyệt đối</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.1 THẺ SỨC KHỎE SỐ 3D MEDIPASS (DIGITAL HEALTH PASS)                     */}
      {/* ========================================================================= */}
      {/* [Tạm thời comment chức năng Thẻ sức khỏe số / Xác thực chip CCCD]
      <DigitalHealthPass />
      */}

      {/* ========================================================================= */}
      {/* 4. ĐỐI TÁC Y TẾ & BỆNH VIỆN ĐỒNG HÀNH (MEDPRO PARTNERS)                    */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Được Tin Tưởng Hợp Tác & Đồng Hành Bởi Các Cơ Sở Y Tế Hàng Đầu
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-5 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          {PARTNERS.map((p, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-slate-700 font-black text-xs sm:text-sm hover:text-blue-600 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs" />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BANNER QUẢNG BÁ CHĂM SÓC SỨC KHỎE 4.0 CÓ ẢNH THỰC TẾ                    */}
      {/* ========================================================================= */}
      {/* [Tạm thời comment banner tư vấn khám bệnh trực tuyến qua video]
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl z-10">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md">
              Chăm sóc sức khỏe 4.0
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
              TƯ VẤN KHÁM BỆNH TRỰC TUYẾN QUA VIDEO
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Gọi video trực tiếp với bác sĩ chuyên khoa mọi lúc, mọi nơi cùng hệ thống MediCare. Bác sĩ tư vấn phác đồ, gửi đơn thuốc điện tử ngay sau cuộc gọi.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/patient/appointments"
                className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-black text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <span>Trải Nghiệm Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:19001234"
                className="px-6 py-3.5 bg-blue-800/60 hover:bg-blue-800 border border-white/20 rounded-2xl font-black text-xs transition-all flex items-center space-x-2"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>Hotline: 1900 1234</span>
              </a>
            </div>
          </div>

          <div className="relative flex-shrink-0 z-10 w-full lg:w-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
            <img
              src="/images/telehealth_banner.jpg"
              alt="Tư vấn khám bệnh trực tuyến qua video"
              className="w-full h-56 sm:h-64 object-cover object-center"
            />
          </div>
        </div>
      </section>
      */}

      {/* ========================================================================= */}
      {/* 6. GIỚI THIỆU ỨNG DỤNG DI ĐỘNG MEDPRO / MEDICARE SMARTCARE APP            */}
      {/* ========================================================================= */}
      <MobileAppShowcase />

      {/* ========================================================================= */}
      {/* 7. CƠ SỞ Y TẾ & CHUYÊN KHOA NỔI BẬT TRONG THÁNG (FEATURED FACILITIES)      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Mạng Lưới Y Tế</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Cơ Sở Y Tế & Chuyên Khoa Nổi Bật Trong Tháng
            </h2>
          </div>
          <Link to="/specialties" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>Xem tất cả chuyên khoa</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_HOSPITALS.map((hosp, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 text-2xl flex items-center justify-center shadow-xs">
                    <Hospital className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                    {hosp.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base leading-snug">
                    {hosp.name}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{hosp.tagline}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{hosp.address}</span>
                  </p>
                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <span>⭐ {hosp.rating}</span>
                    <span className="text-slate-400 font-normal">({hosp.reviews} đánh giá)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <Link
                  to="/patient/appointments"
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <span>Đặt khám ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BÁC SĨ CHUYÊN KHOA TIÊU BIỂU (DOCTORS CARDS)                           */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Đội Ngũ Chuyên Gia</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Bác Sĩ Tư Vấn & Khám Chữa Bệnh Hàng Đầu
            </h2>
          </div>
          <Link to="/doctors" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>Xem tất cả bác sĩ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.slice(0, 4).map((doc) => {
            const initial = (doc.fullName || doc.user?.fullName || 'BS').charAt(0);
            const docName = doc.fullName || doc.user?.fullName || `BS. ${doc.licenseNo}`;
            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center flex flex-col justify-between"
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-blue-50">
                    {initial}
                  </div>
                  <h3 className="font-black text-slate-900 text-base">{docName}</h3>
                  <p className="text-xs text-blue-600 font-bold mt-0.5">
                    {doc.specialization || 'Bác sĩ chuyên khoa'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Chứng chỉ: {doc.licenseNo || 'LIC-001'}</p>
                  <div className="mt-2 flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="text-slate-400 font-normal">(4.9/5)</span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <Link
                    to={`/patient/appointments?deptId=${doc.departmentId || ''}&doctorId=${doc.id}`}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <span>Đặt lịch khám</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. QUY TRÌNH 4 BƯỚC ĐI KHÁM THÔNG MINH KHÔNG XẾP HÀNG                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Tiện Lợi & Nhanh Chóng</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Quy Trình Khám Bệnh Thông Minh Tại MediCare
            </h2>
            <p className="text-slate-400 text-xs">Chỉ mất 2 phút đặt hẹn để tiết kiệm đến 80% thời gian chờ đợi tại bệnh viện</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center">1</div>
              <h3 className="font-bold text-white text-sm">Đặt Lịch Trực Tuyến</h3>
              <p className="text-slate-400 leading-relaxed">Chọn chuyên khoa, bác sĩ yêu thích và khung giờ tiếp nhận phù hợp với bạn.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center">2</div>
              <h3 className="font-bold text-white text-sm">Nhận Vé Khám Điện Tử</h3>
              <p className="text-slate-400 leading-relaxed">Hệ thống sinh Vé Khám có mã QR Code tức thì, lưu trên điện thoại hoặc in ra giấy.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-black text-base flex items-center justify-center">3</div>
              <h3 className="font-bold text-white text-sm">Quét QR Tại Quầy</h3>
              <p className="text-slate-400 leading-relaxed">Đến quầy tiếp nhận đưa mã QR để lấy Số Thứ Tự phòng khám tự động trong 5 giây.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center">4</div>
              <h3 className="font-bold text-white text-sm">Vào Khám & Nhận Thuốc</h3>
              <p className="text-slate-400 leading-relaxed">Theo dõi bảng số nhảy tại cửa phòng, gặp bác sĩ và nhận đơn thuốc điện tử tiện lợi.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
