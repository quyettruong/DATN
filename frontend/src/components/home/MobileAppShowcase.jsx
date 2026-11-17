import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Clock, 
  Video, 
  FileSearch, 
  CreditCard, 
  Home as HomeIcon, 
  Building2, 
  QrCode, 
  Bell, 
  User, 
  Calendar, 
  Stethoscope, 
  FlaskConical, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const MobileAppShowcase = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white via-sky-50/40 to-white relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-100/80 border border-blue-200 rounded-full text-blue-800 text-xs font-bold shadow-xs">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Giao Diện Web Tương Thích Mọi Thiết Bị Di Động</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Trải Nghiệm Khám Chữa Bệnh Thông Minh Ngay Trên Điện Thoại
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Mọi thao tác từ đặt hẹn, nhận số thứ tự, theo dõi bảng số nhảy đến tra cứu hồ sơ và đơn thuốc đều được gói gọn trong lòng bàn tay.
          </p>
        </div>

        {/* Main 3-Column Layout: Left Features - Center Phone Mockup - Right Features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* CỘT TRÁI (3 Tính năng) */}
          <div className="lg:col-span-4 space-y-8 text-center lg:text-right">
            
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row-reverse items-center lg:items-start gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  Lấy Số Thứ Tự Khám Nhanh Trực Tuyến
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đăng ký khám & tái khám nhanh theo ngày. Chọn bác sĩ chuyên khoa yêu thích, lấy số thứ tự thấp nhất không cần đến sớm xếp hàng.
                </p>
              </div>
            </div>

            {/* [Tạm thời comment chức năng Tư Vấn Sức Khỏe Từ Xa 4.0 / Cuộc gọi video]
            <div className="flex flex-col lg:flex-row-reverse items-center lg:items-start gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base group-hover:text-cyan-600 transition-colors">
                  Tư Vấn Sức Khỏe Từ Xa 4.0
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cuộc gọi video bảo mật chuẩn y tế với các chuyên gia đầu ngành. Nhận đơn thuốc điện tử và lời dặn trực tiếp sau cuộc gọi.
                </p>
              </div>
            </div>
            */}

            {/* Feature 3 */}
            <div className="flex flex-col lg:flex-row-reverse items-center lg:items-start gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                <FileSearch className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                  Tra Cứu Kết Quả Cận Lâm Sàng
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Xem kết quả xét nghiệm máu, nước tiểu, chỉ số sinh hóa định lượng trực tiếp trên ứng dụng ngay khi phòng Lab xét nghiệm xong.
                </p>
              </div>
            </div>

          </div>

          {/* CỘT GIỮA: MÔ HÌNH ĐIỆN THOẠI THÔNG MINH (SMARTPHONE MOCKUP CHUẨN MEDPRO) */}
          <div className="lg:col-span-4 flex justify-center py-4 relative">
            
            {/* Vòng Tròn Phát Sáng Xanh Bao Quanh Điện Thoại (Glowing Ring Effect) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] rounded-full border-4 border-dashed border-cyan-400/40 animate-spin-slow" />
              <div className="absolute w-[360px] h-[360px] sm:w-[430px] sm:h-[430px] rounded-full border border-blue-500/20" />
            </div>

            {/* Khung Vỏ Điện Thoại (Device Body) */}
            <div className="relative w-[290px] sm:w-[310px] bg-slate-950 rounded-[44px] p-3 shadow-2xl shadow-blue-900/30 border-4 border-slate-800 ring-1 ring-slate-700/50">
              
              {/* Dynamic Island / Loa thoại trên cùng */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-2" />
              </div>

              {/* Màn Hình Ứng Dụng (Screen Viewport) */}
              <div className="relative bg-slate-50 rounded-[36px] overflow-hidden flex flex-col h-[580px] sm:h-[620px] text-slate-800 text-xs select-none">
                
                {/* Status Bar */}
                <div className="bg-blue-600 text-white px-6 pt-3 pb-1 flex justify-between items-center text-[10px] font-bold">
                  <span>09:41</span>
                  <div className="flex items-center space-x-1.5">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* App Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 pt-2 pb-4 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white text-blue-600 font-black text-xs flex items-center justify-center shadow-xs">
                        MC
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-200">Xin chào bạn,</p>
                        <p className="font-bold text-xs leading-none">Bệnh Viện MediCare</p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* App Search Bar */}
                  <div className="bg-white/95 rounded-full px-3 py-1.5 text-slate-400 flex items-center space-x-2 text-[10px] shadow-xs">
                    <Smartphone className="w-3 h-3 text-blue-600" />
                    <span className="truncate">Tìm chuyên khoa, bác sĩ, dịch vụ...</span>
                  </div>
                </div>

                {/* App Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/80">
                  
                  {/* Lưới 9 Icon Dịch Vụ Di Động (Y hệt màn hình Medpro) */}
                  <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100">
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Đặt khám cơ sở</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Khám bác sĩ</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Lấy số khám</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Gói sức khỏe</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                          <FlaskConical className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Xét nghiệm</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Viện phí online</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                          <FileSearch className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Tra cứu KQ</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                          <Phone className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Tổng đài 1900</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-1">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Hướng dẫn</span>
                      </div>

                    </div>
                  </div>

                  {/* Mini Promotion Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                      <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[8px] font-bold uppercase">Ưu đãi 4.0</span>
                      <p className="font-black text-[11px] mt-1 leading-tight">Tư Vấn Khám Bệnh Từ Xa</p>
                      <p className="text-[9px] text-blue-200">Gặp bác sĩ online mọi lúc mọi nơi</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-cyan-200" />
                    </div>
                  </div>

                  {/* Mini Vé Khám Gần Nhất */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-700">Lịch khám sắp tới</span>
                      <span className="text-blue-600 font-bold">#APPT-0001</span>
                    </div>
                    <p className="font-bold text-slate-900 text-[11px]">Khoa Nội Tổng Quát</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-50">
                      <span>09:00 · 10/10/2026</span>
                      <span className="text-emerald-600 font-bold">✓ Đã xác nhận</span>
                    </div>
                  </div>

                </div>

                {/* App Bottom Navigation Bar */}
                <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="flex flex-col items-center text-blue-600">
                    <HomeIcon className="w-4 h-4" />
                    <span>Trang chủ</span>
                  </div>
                  <div className="flex flex-col items-center hover:text-slate-700">
                    <FileText className="w-4 h-4" />
                    <span>Hồ sơ</span>
                  </div>
                  <div className="flex flex-col items-center hover:text-slate-700 relative">
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                    <QrCode className="w-4 h-4" />
                    <span>Phiếu khám</span>
                  </div>
                  <div className="flex flex-col items-center hover:text-slate-700">
                    <Bell className="w-4 h-4" />
                    <span>Thông báo</span>
                  </div>
                  <div className="flex flex-col items-center hover:text-slate-700">
                    <User className="w-4 h-4" />
                    <span>Tài khoản</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* CỘT PHẢI (3 Tính năng) */}
          <div className="lg:col-span-4 space-y-8 text-center lg:text-left">
            
            {/* Feature 4 */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                  Thanh Toán Viện Phí Đa Kênh
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đa dạng phương thức thanh toán viện phí trực tuyến (QR Pay, thẻ ATM, Visa, ví điện tử). Hỗ trợ trừ chi phí BHYT đúng tuyến.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                  Chăm Sóc Y Tế Tận Nhà
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dịch vụ y tế tại nhà (lấy mẫu xét nghiệm, điều dưỡng chăm sóc, truyền dịch) chuyên nghiệp, đáp ứng nhu cầu chăm sóc sức khỏe chất lượng cao.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                  Mạng Lưới Cơ Sở Y Tế Kết Nối
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ sinh thái liên kết với hơn 100+ bệnh viện đa khoa, phòng khám chuyên sâu, phòng mạch tư nhân uy tín rộng khắp toàn quốc.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MobileAppShowcase;
