import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  ShieldCheck, 
  QrCode, 
  RotateCw, 
  Heart, 
  Activity, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  UserCheck,
  CreditCard,
  Lock,
  PhoneCall,
  Info
} from 'lucide-react';

const DigitalHealthPass = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState('demo'); // 'personal' or 'demo'

  // Dữ liệu thẻ sức khỏe đồng bộ từ hồ sơ bệnh nhân thực tế khi đã đăng nhập
  const patientData = isAuthenticated && user ? {
    fullName: user.fullName || 'Bệnh nhân MediCare',
    idNumber: user.patientCode || (user.id ? `MED-${String(user.id).padStart(6, '0')}` : 'MED-889921'),
    bhyt: user.insuranceNumber || 'DN 4 79 79 214 00812',
    bloodType: user.bloodType || 'Chưa cập nhật',
    birthYear: user.dob ? String(user.dob).substring(0, 4) : '—',
    allergies: user.allergies || 'Chưa ghi nhận tiền sử dị ứng',
    chronicConditions: user.medicalHistory || 'Chưa ghi nhận bệnh lý nền',
    emergencyContact: user.phone || 'Cập nhật tại Hồ sơ cá nhân',
    status: 'Đã đồng bộ Hồ sơ Bệnh án Điện tử',
    cardTier: 'MediPass Verified'
  } : {
    fullName: 'NGUYỄN VĂN AN',
    idNumber: 'MED-889921',
    bhyt: 'DN 4 79 79 214 00812',
    bloodType: 'A+ (Rh dương)',
    birthYear: '1992',
    allergies: 'Kháng sinh nhóm Beta-Lactam',
    chronicConditions: 'Viêm mũi dị ứng thời tiết',
    emergencyContact: '0988.123.456 (Chị gái ICE)',
    status: 'Đã xác thực CCCD gắn chip',
    cardTier: 'VIP Health Member'
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Container với nền dark sang trọng / futuristic glassmorphism */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 sm:p-12 text-white overflow-hidden border border-slate-800 shadow-2xl">
        
        {/* Glow ambient background effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* CỘT TRÁI: GIỚI THIỆU & GIÁ TRỊ VƯỢT TRỘI CỦA THẺ SỨC KHỎE SỐ */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin-slow" />
              <span>CÔNG NGHỆ ĐỘT PHÁ 2026: TIẾP NHẬN BỆNH NHÂN 1 CHẠM</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Thẻ Sức Khỏe Số 3D <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  MediPass Holographic
                </span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Tạm biệt sổ khám giấy và việc chờ đợi khai báo rườm rà. Thẻ thông minh tích hợp hồ sơ điện tử, nhóm máu, dị ứng thuốc và mã QR tiếp nhận tự động chuẩn hóa Kiosk bệnh viện.
              </p>
            </div>

            {/* 3 Lợi thế bento mini */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm hover:border-cyan-500/50 transition-all">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 font-black text-sm">
                  ⚡ 3s
                </div>
                <h4 className="text-xs font-bold text-white">Chạm Kiosk 3 Giây</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Quét QR nhận ngay số thứ tự ưu tiên vào thẳng phòng khám.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm hover:border-sky-500/50 transition-all">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 font-black text-sm">
                  🛡️ ICE
                </div>
                <h4 className="text-xs font-bold text-white">Cấp Cứu Khẩn Cấp</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Hiển thị nhóm máu & dị ứng thuốc bảo vệ bạn trong mọi tình huống.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm hover:border-blue-500/50 transition-all">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 font-black text-sm">
                  ☁️ VssID
                </div>
                <h4 className="text-xs font-bold text-white">Đồng Bộ BHYT</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Tự động tra cứu quyền lợi bảo hiểm và lịch sử cấp thuốc quốc gia.
                </p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? "/patient/appointments?tab=my" : "/register"}
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
              >
                <span>{isAuthenticated ? 'Xem Vé & Thẻ Của Bạn' : 'Kích Hoạt Thẻ Miễn Phí'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
              
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center space-x-2"
              >
                <RotateCw className={`w-4 h-4 text-cyan-400 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                <span>{isFlipped ? 'Xem Mặt Trước (QR Check-in)' : 'Lật Xem Cảnh Báo Dị Ứng (ICE)'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Mã hóa 256-bit chuẩn HIPAA
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Tương thích Apple / Google Wallet
              </span>
            </div>
          </div>

          {/* CỘT PHẢI: INTERACTIVE 3D HOLOGRAPHIC CARD */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            {/* Card Container với perspective 3D */}
            <div className="relative w-full max-w-sm sm:max-w-md h-[270px] sm:h-[285px] perspective-1000 group cursor-pointer"
                 onClick={() => setIsFlipped(!isFlipped)}>
              
              {/* Vỏ quay thẻ 3D lật 180 độ */}
              <div 
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d shadow-2xl rounded-3xl ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                
                {/* ── MẶT TRƯỚC (FRONT OF CARD) ── */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-cyan-400/30 overflow-hidden flex flex-col justify-between shadow-2xl shadow-cyan-500/10">
                  
                  {/* Hiệu ứng tia sáng Holographic Shimmer chạy chéo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none" />
                  
                  {/* Decorative background watermarks */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/15 rounded-full blur-xl pointer-events-none" />

                  {/* Top Bar của thẻ */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
                        <Activity className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <span className="font-black text-sm tracking-wider text-white">MediPass</span>
                        <span className="block text-[9px] text-cyan-300 font-bold uppercase tracking-widest">Digital Health ID</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs">
                      {patientData.cardTier}
                    </span>
                  </div>

                  {/* Giữa thẻ: Chip mạ vàng + Nhóm máu + QR Code */}
                  <div className="relative z-10 flex items-center justify-between my-1">
                    <div className="space-y-3">
                      {/* EMV Smart Chip */}
                      <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300/60 p-1 flex flex-col justify-between shadow-sm">
                        <div className="w-full h-1 bg-amber-700/40 rounded-xs" />
                        <div className="w-3/4 h-1 bg-amber-700/40 rounded-xs" />
                        <div className="w-full h-1 bg-amber-700/40 rounded-xs" />
                      </div>

                      {/* Thông tin nhanh: Nhóm máu */}
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-black flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                          {patientData.bloodType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          ✓ BHYT Active
                        </span>
                      </div>
                    </div>

                    {/* QR Code động quét tại quầy */}
                    <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-cyan-300/40 flex flex-col items-center">
                      <QrCode className="w-16 h-16 text-slate-900" />
                      <span className="text-[8px] font-black text-slate-800 uppercase tracking-tighter mt-1">KIOSK SCAN</span>
                    </div>
                  </div>

                  {/* Đáy thẻ: Tên bệnh nhân & Mã định danh */}
                  <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Họ và Tên Chủ Thẻ</p>
                      <p className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                        {patientData.fullName}
                      </p>
                      <p className="text-[10px] text-cyan-400 font-mono tracking-widest mt-0.5">
                        {patientData.idNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-mono uppercase">Mã Thẻ BHYT</p>
                      <p className="text-[11px] font-bold text-slate-200 font-mono">
                        {patientData.bhyt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── MẶT SAU (BACK OF CARD - EMERGENCY & ALLERGY ALERT) ── */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-rose-950 border-2 border-rose-500/30 overflow-hidden flex flex-col justify-between shadow-2xl">
                  
                  {/* Decorative ambient */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header mặt sau */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center space-x-2 text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">Hồ Sơ Cấp Cứu Y Khoa (ICE)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">EMERGENCY PROTOCOL</span>
                  </div>

                  {/* Nội dung cảnh báo dị ứng & bệnh mãn tính */}
                  <div className="space-y-3 my-2 text-xs">
                    <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-2.5">
                      <div className="text-[10px] font-black text-rose-300 uppercase tracking-wide flex items-center gap-1">
                        ⚠️ Dị ứng thuốc & Thực phẩm:
                      </div>
                      <p className="font-bold text-rose-100 text-xs mt-0.5">{patientData.allergies}</p>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        Tiền sử bệnh lý / Cảnh báo lâm sàng:
                      </div>
                      <p className="font-medium text-slate-200 text-xs mt-0.5">{patientData.chronicConditions}</p>
                    </div>

                    <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2">
                      <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                        Liên hệ khẩn cấp (ICE):
                      </span>
                      <span className="text-xs font-black text-cyan-300">{patientData.emergencyContact}</span>
                    </div>
                  </div>

                  {/* Đáy mặt sau: Hotline 115 */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
                    <span>Đường dây nóng cấp cứu MediCare: <strong className="text-white">1900 1234</strong></span>
                    <span className="text-cyan-400 font-bold">Chạm để lật lại ↻</span>
                  </div>

                </div>

              </div>
            </div>

            {/* Hint phía dưới thẻ */}
            <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5 animate-pulse">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nhấp vào thẻ hoặc nút lật để chuyển đổi giữa Mã Tiếp Nhận và Cảnh Báo Khẩn Cấp</span>
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};

export default DigitalHealthPass;

