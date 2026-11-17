import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import FloatingMedicalDock from '../components/common/FloatingMedicalDock';
import { 
  Phone, 
  User, 
  LogOut, 
  Calendar, 
  Clock, 
  QrCode, 
  FileText, 
  Pill, 
  Activity, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles, 
  Hospital, 
  Stethoscope, 
  ShieldCheck,
  Smartphone,
  Facebook,
  Youtube,
  Search,
  ArrowRight,
  Building2,
  Users,
  UserRound,
  Heart,
  Smile,
  Eye,
  CreditCard,
  CalendarCheck
} from 'lucide-react';

const WORKSPACE_PATHS = {
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  STAFF: '/staff',
  LAB_TECHNICIAN: '/lab',
};

const PatientPortalLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const workspacePath = user?.role ? WORKSPACE_PATHS[user.role] : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white print:bg-white">
      
      {/* ── 1. Top Bar (Mạng xã hội, Tải App, Tài khoản) ── */}
      <div className="print:hidden bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Social Links */}
          <div className="hidden sm:flex items-center space-x-4 text-[11px] font-medium">
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              🎵 TikTok
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Facebook className="w-3.5 h-3.5 text-blue-400" /> Facebook
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              💬 Zalo OA
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube
            </span>
          </div>

          {/* Right actions: Tải App, Tài khoản, Cờ VN */}
          <div className="flex items-center space-x-3 ml-auto text-xs">
            {workspacePath && (
              <Link
                to={workspacePath}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full font-black transition-all text-[11px] shadow-xs"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Vào Bảng Điều Khiển</span>
              </Link>
            )}

            <Link 
              to="/queue-display"
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold transition-all text-[11px] shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Bảng Gọi Số TV</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                    {(user?.fullName || 'U').charAt(0)}
                  </div>
                  <span className="text-xs truncate max-w-[120px]">{user?.fullName || 'Người dùng'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-700 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-black text-slate-900 text-sm">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">#{user?.username}</p>
                    </div>
                    {workspacePath ? (
                      <Link 
                        to={workspacePath} 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-bold transition-colors"
                      >
                        <Activity className="w-4 h-4 mr-2.5 text-blue-600" /> Bảng Điều Khiển Nghiệp Vụ
                      </Link>
                    ) : (
                      <>
                        <Link 
                          to="/patient/appointments?tab=my" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <QrCode className="w-4 h-4 mr-2.5 text-blue-600" /> Vé Khám Của Tôi
                        </Link>
                        <Link 
                          to="/patient/prescriptions" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <Pill className="w-4 h-4 mr-2.5 text-teal-600" /> Đơn Thuốc Điện Tử
                        </Link>
                        <Link 
                          to="/patient/history" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2.5 text-purple-600" /> Lịch Sử Khám & CLS
                        </Link>
                        <Link 
                          to="/patient/invoices" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <CreditCard className="w-4 h-4 mr-2.5 text-emerald-600" /> Hóa Đơn & Viện Phí
                        </Link>
                        <Link 
                          to="/patient/follow-ups" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <CalendarCheck className="w-4 h-4 mr-2.5 text-amber-600" /> Lịch Hẹn Tái Khám
                        </Link>
                      </>
                    )}
                    <Link 
                      to="/profile" 
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2.5 text-slate-500" /> Hồ Sơ Cá Nhân
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 hover:bg-rose-50 text-rose-600 transition-colors font-bold text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" /> Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-blue-400 text-blue-300 hover:bg-blue-600 hover:text-white transition-all font-bold text-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </Link>
            )}

            <span className="text-slate-400 font-bold flex items-center gap-1 pl-1">
              🇻🇳 VN
            </span>
          </div>

        </div>
      </div>

      {/* ── 2. Main Navigation Bar (Logo MediCare, Hotline 1900 1234, Menu) ── */}
      <header className="print:hidden bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-blue-600 flex items-center gap-1">
                <span>Medi</span><span className="text-slate-900">Care</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Hệ Thống Y Tế Số
              </p>
            </div>
          </Link>

          {/* Hotline Tư Vấn (Medpro Hotline Box - Clickable) */}
          <a 
            href="tel:19001234" 
            title="Gọi ngay tổng đài tư vấn y tế 1900 1234"
            className="hidden lg:flex items-center space-x-3 pl-4 border-l border-slate-200 group hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tư vấn / Đặt khám 24/7</p>
              <p className="text-base font-black text-rose-600 tracking-tight leading-none mt-0.5">
                1900 1234
              </p>
            </div>
          </a>

          {/* Center Navigation Links - Clean, Elegant & Directly Clickable */}
          <nav className="hidden xl:flex items-center space-x-7 text-[13px] font-semibold text-slate-700">
            <NavLink 
              to="/specialties" 
              className={({ isActive }) => `
                py-2 transition-all whitespace-nowrap relative hover:text-blue-600
                ${isActive ? 'text-blue-600 font-bold after:absolute after:-bottom-3.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full' : 'text-slate-700'}
              `}
            >
              Chuyên Khoa
            </NavLink>

            <NavLink 
              to="/doctors" 
              className={({ isActive }) => `
                py-2 transition-all whitespace-nowrap relative hover:text-blue-600
                ${isActive ? 'text-blue-600 font-bold after:absolute after:-bottom-3.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full' : 'text-slate-700'}
              `}
            >
              Bác Sĩ
            </NavLink>

            <NavLink 
              to="/patient/queue" 
              className={({ isActive }) => `
                py-2 transition-all whitespace-nowrap flex items-center gap-1.5 relative hover:text-blue-600
                ${isActive ? 'text-blue-600 font-bold after:absolute after:-bottom-3.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full' : 'text-slate-700'}
              `}
            >
              <span>Hàng Đợi Trực Tiếp</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </NavLink>

            <NavLink 
              to="/patient/prescriptions" 
              className={({ isActive }) => `
                py-2 transition-all whitespace-nowrap relative hover:text-blue-600
                ${isActive ? 'text-blue-600 font-bold after:absolute after:-bottom-3.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full' : 'text-slate-700'}
              `}
            >
              Đơn Thuốc Điện Tử
            </NavLink>

            <NavLink 
              to="/patient/history" 
              className={({ isActive }) => `
                py-2 transition-all whitespace-nowrap relative hover:text-blue-600
                ${isActive ? 'text-blue-600 font-bold after:absolute after:-bottom-3.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full' : 'text-slate-700'}
              `}
            >
              Hồ Sơ Y Tế
            </NavLink>

            <NavLink 
              to="/patient/invoices" 
              className={({ isActive }) => `
                py-2 transition-all whitespace-nowrap relative hover:text-blue-600
                ${isActive ? 'text-blue-600 font-bold after:absolute after:-bottom-3.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full' : 'text-slate-700'}
              `}
            >
              Viện Phí
            </NavLink>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center space-x-3">
            <Link
              to="/patient/appointments"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs shadow-md shadow-blue-600/25 transition-all flex items-center space-x-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Khám Ngay</span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-2 text-sm font-bold text-slate-700">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <Hospital size={16} className="text-blue-600" />
              <span>Trang Chủ</span>
            </Link>
            <Link to="/specialties" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <Building2 size={16} className="text-blue-600" />
              <span>Chuyên Khoa</span>
            </Link>
            <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <UserRound size={16} className="text-blue-600" />
              <span>Đội Ngũ Bác Sĩ</span>
            </Link>
            <Link to="/patient/appointments" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <Calendar size={16} className="text-indigo-600" />
              <span>Đặt Lịch Khám</span>
            </Link>
            <Link to="/patient/queue" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <Activity size={16} className="text-emerald-500" />
              <span>Hàng Đợi Trực Tiếp</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block ml-auto" />
            </Link>
            <Link to="/patient/prescriptions" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <Pill size={16} className="text-blue-500" />
              <span>Đơn Thuốc Điện Tử</span>
            </Link>
            <Link to="/patient/history" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <FileText size={16} className="text-indigo-500" />
              <span>Hồ Sơ Y Tế</span>
            </Link>
            <Link to="/patient/invoices" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <CreditCard size={16} className="text-emerald-500" />
              <span>Hóa Đơn & Viện Phí</span>
            </Link>
            <Link to="/patient/follow-ups" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 hover:text-blue-600">
              <CalendarCheck size={16} className="text-amber-500" />
              <span>Lịch Tái Khám</span>
            </Link>
            <div className="pt-3 border-t border-slate-100 text-rose-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone size={16} /> Hotline: 1900 1234
              </div>
              <a href="tel:19001234" className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded-full font-bold">Gọi ngay</a>
            </div>
          </div>
        )}
      </header>

      {/* ── 3. Dải Băng Cam Marquee Chạy Chữ Thông Báo (Medpro Banner) ── */}
      <div className="print:hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-2.5 px-4 shadow-xs text-xs font-semibold overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center">
          <span className="bg-white/20 px-3 py-0.5 rounded-full mr-3 flex-shrink-0 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Tiếp Nhận Thông Minh</span>
          </span>
          <div className="overflow-hidden whitespace-nowrap text-ellipsis flex-1">
            Đặt lịch khám trực tuyến để nhận Vé Khám Điện Tử có mã QR, vào thẳng phòng khám ưu tiên không cần xếp hàng lấy số giấy. Tổng đài hỗ trợ 24/7: <strong>1900 1234</strong>
          </div>
        </div>
      </div>

      {/* ── 4. Main Dynamic Body Content ── */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ── 5. Nút Gọi Hotline Nổi Tròn Màu Cam (Floating Call Button) ── */}
      <a
        href="tel:19001234"
        title="Gọi tổng đài tư vấn y tế"
        className="print:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group ring-4 ring-orange-400/30"
      >
        <Phone className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
      </a>

      {/* ── 6. Footer Đầy Đủ Chuẩn Bệnh Viện Đa Khoa (Medpro / Vinmec style) ── */}
      <footer className="print:hidden bg-slate-900 text-white mt-16 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
          
          {/* Cột 1: Thông tin bệnh viện */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Hospital className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">MediCare Hospital</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Hệ Thống Y Tế Số & Tiếp Nhận Khám Chữa Bệnh Thông Minh – Tiên phong chuyển đổi số y tế, mang đến trải nghiệm khám bệnh nhanh chóng, chuẩn xác và không phải chờ đợi.
            </p>
            <div className="text-slate-400 space-y-1">
              <p>📍 Số 123 Đường Sức Khỏe, Quận 1, TP. Hồ Chí Minh</p>
              <p>📞 Tổng đài đặt khám: <strong className="text-white">1900 1234</strong></p>
              <p>✉️ Email hỗ trợ: <strong className="text-white">cskh@medicare.vn</strong></p>
            </div>
          </div>

          {/* Cột 2: Dịch vụ y tế */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-sm uppercase tracking-wider">Dịch Vụ Y Tế</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><Link to="/patient/appointments" className="hover:text-blue-400 transition-colors">Đặt khám chuyên khoa</Link></li>
              <li><Link to="/patient/appointments" className="hover:text-blue-400 transition-colors">Đặt lịch bác sĩ yêu thích</Link></li>
              <li><Link to="/patient/queue" className="hover:text-blue-400 transition-colors">Theo dõi hàng đợi số nhảy</Link></li>
              <li><Link to="/patient/prescriptions" className="hover:text-blue-400 transition-colors">Tra cứu đơn thuốc điện tử</Link></li>
              <li><Link to="/patient/history" className="hover:text-blue-400 transition-colors">Hồ sơ bệnh án & kết quả CLS</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hướng dẫn người bệnh */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-sm uppercase tracking-wider">Tiện Ích Trực Tuyến</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><Link to="/specialties" className="hover:text-blue-400 transition-colors">Danh mục chuyên khoa khám bệnh</Link></li>
              <li><Link to="/doctors" className="hover:text-blue-400 transition-colors">Tra cứu đội ngũ bác sĩ đầu ngành</Link></li>
              <li><Link to="/patient/invoices" className="hover:text-blue-400 transition-colors">Thanh toán viện phí & BHYT VietQR</Link></li>
              <li><Link to="/patient/follow-ups" className="hover:text-blue-400 transition-colors">Quản lý lịch hẹn tái khám định kỳ</Link></li>
              <li><Link to="/queue-display" className="hover:text-blue-400 transition-colors">Bảng gọi số điện tử toàn bệnh viện</Link></li>
            </ul>
          </div>

          {/* Cột 4: Giấy phép & Chứng nhận */}
          <div className="space-y-4">
            <h4 className="font-black text-white text-sm uppercase tracking-wider">Chứng Nhận & Bản Quyền</h4>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>Chuẩn Y Tế Số Quốc Gia 2026</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Giấy phép hoạt động khám bệnh, chữa bệnh số 0123/BYT-GPHĐ cấp bởi Bộ Y Tế. Hệ thống mã hóa bảo mật chuẩn HIPAA/GDPR.
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              © 2026 MediCare Digital Hospital Flow. Tất cả các quyền được bảo lưu.
            </p>
          </div>

        </div>
      </footer>

      {/* ── 3. Thanh Điều Khiển Y Tế Nổi Độc Bản (Dynamic Island Dock) ── */}
      <FloatingMedicalDock />

    </div>
  );
};

export default PatientPortalLayout;

