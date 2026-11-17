import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PhoneCall, 
  Calendar, 
  Clock, 
  X, 
  ChevronUp, 
  ChevronDown, 
  AlertTriangle, 
  Activity, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import api from '../../api/axios';

const STATUS_LABELS = {
  WAITING: { label: 'Đang chờ gọi', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  CALLED: { label: 'Đang gọi vào khám', cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  IN_EXAM: { label: 'Đang khám bệnh', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  COMPLETED: { label: 'Đã hoàn tất khám', cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  SKIPPED: { label: 'Tạm qua lượt', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

const FloatingMedicalDock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMinimized, setIsMinimized] = useState(false);
  const [activePopover, setActivePopover] = useState(null); // 'queue' | 'sos' | null
  const [queueSearchCode, setQueueSearchCode] = useState('');
  const [quickQueueResult, setQuickQueueResult] = useState(null);
  const [lookupNotFound, setLookupNotFound] = useState(false);
  const [isSearchingQueue, setIsSearchingQueue] = useState(false);

  // Scroll to Symptom Navigator
  const handleOpenSymptomNavigator = () => {
    if (location.pathname === '/') {
      const el = document.getElementById('symptom-navigator');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/#symptom-navigator');
    }
  };

  // Real lookup patient queue via GET /api/queues/lookup
  const handleQuickQueueLookup = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = queueSearchCode.trim();
    if (!cleanCode) return;

    setIsSearchingQueue(true);
    setLookupNotFound(false);
    try {
      const res = await api.get(`/api/queues/lookup?q=${encodeURIComponent(cleanCode)}`);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (list.length > 0) {
        const ticket = list[0];
        setQuickQueueResult({
          queueNumber: ticket.queueNumber,
          patientName: ticket.patientName || 'Bệnh nhân',
          roomName: ticket.roomName || 'Phòng khám chuyên khoa',
          doctorName: ticket.doctorName || 'Bác sĩ trực',
          estimatedMinutes: ticket.estimatedWaitMinutes ?? 15,
          status: ticket.status || 'WAITING'
        });
      } else {
        setQuickQueueResult(null);
        setLookupNotFound(true);
      }
    } catch (err) {
      setQuickQueueResult(null);
      setLookupNotFound(true);
    } finally {
      setIsSearchingQueue(false);
    }
  };

  const badgeInfo = quickQueueResult ? (STATUS_LABELS[quickQueueResult.status] || STATUS_LABELS.WAITING) : null;

  return (
    <>
      {/* ── 1. MODAL KHẨN CẤP SOS (KHI BẤM NÚT CẤP CỨU) ── */}
      {activePopover === 'sos' && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-rose-500/50 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            
            <button
              onClick={() => setActivePopover(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40">
                <ShieldAlert className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Trợ Giúp Y Tế Khẩn Cấp</span>
                <h3 className="text-xl font-black text-white">Đường Dây Nóng Cấp Cứu 24/7</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nếu bạn hoặc người thân đang gặp tình trạng khó thở nặng, co giật, đau ngực cấp tính hoặc tai nạn nghiêm trọng, hãy kích hoạt cuộc gọi khẩn cấp ngay:
            </p>

            <div className="space-y-3">
              <a
                href="tel:115"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl font-black text-sm flex items-center justify-between shadow-lg shadow-rose-600/30 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <PhoneCall className="w-5 h-5" />
                  <span>Gọi Cấp Cứu Quốc Gia (115)</span>
                </div>
                <span className="text-xs font-mono bg-white/20 px-2.5 py-1 rounded-lg">BẤM GỌI</span>
              </a>

              <a
                href="tel:19001234"
                className="w-full py-3.5 px-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Trực Ban Cấp Cứu MediCare (1900 1234)</span>
                </div>
                <span className="text-xs font-mono text-cyan-300">24/7</span>
              </a>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Xe cứu thương chuyên dụng sẵn sàng xuất phát trong vòng 5 phút từ điểm trạm gần nhất.</span>
            </div>

            <button
              onClick={() => setActivePopover(null)}
              className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-medium text-center transition-colors"
            >
              Đóng cửa sổ này
            </button>
          </div>
        </div>
      )}

      {/* ── 2. POPOVER TRA CỨU HÀNG ĐỢI NHANH ── */}
      {activePopover === 'queue' && (
        <div className="print:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-white p-5 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>Tra Cứu Tiến Độ Khám Thực Tế</span>
            </div>
            <button
              onClick={() => setActivePopover(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form nhập mã */}
          <form onSubmit={handleQuickQueueLookup} className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={queueSearchCode}
                onChange={(e) => {
                  setQueueSearchCode(e.target.value);
                  setLookupNotFound(false);
                }}
                placeholder="Nhập Số Thứ Tự (VD: A001, W002)..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={isSearchingQueue}
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition-colors flex-shrink-0"
              >
                {isSearchingQueue ? '...' : 'Tra'}
              </button>
            </div>
          </form>

          {/* Result Card */}
          {quickQueueResult ? (
            <div className="mt-3 p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2.5">
              <div className="flex justify-between items-center text-xs gap-2">
                <span className="font-bold text-white truncate">{quickQueueResult.roomName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border whitespace-nowrap ${badgeInfo.cls}`}>
                  {badgeInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center py-2.5 bg-slate-900 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400">Số phiếu khám</span>
                  <p className="text-xl font-black text-amber-400 font-mono">{quickQueueResult.queueNumber}</p>
                </div>
                <div className="border-l border-slate-800 px-2">
                  <span className="text-[10px] text-slate-400">Bác sĩ phụ trách</span>
                  <p className="text-xs font-bold text-cyan-300 truncate mt-1.5">{quickQueueResult.doctorName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="truncate max-w-[170px]">BN: <strong className="text-white">{quickQueueResult.patientName}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setActivePopover(null);
                    navigate('/queue-display');
                  }}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-bold flex-shrink-0"
                >
                  <span>Màn hình TV</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : lookupNotFound ? (
            <div className="mt-3 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center text-[11px] text-rose-200 space-y-1.5">
              <p className="font-bold">Không tìm thấy phiếu khám "{queueSearchCode.trim().toUpperCase()}" trong hôm nay.</p>
              <button
                type="button"
                onClick={() => { setActivePopover(null); navigate('/patient/queue'); }}
                className="text-cyan-400 hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Mở trang Hàng Đợi Chi Tiết</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-slate-800/40 rounded-xl text-center text-[11px] text-slate-400">
              Nhập mã số thứ tự hoặc mở <button type="button" onClick={() => { setActivePopover(null); navigate('/queue-display'); }} className="text-cyan-400 hover:underline font-bold">Bảng Gọi Số TV Toàn Viện</button> để theo dõi trực tiếp.
            </div>
          )}

        </div>
      )}

      {/* ── 3. FLOATING ISLAND DOCK BAR ── */}
      <aside 
        aria-label="Thanh điều khiển y tế thông minh"
        className="print:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300"
      >
        {isMinimized ? (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 backdrop-blur-xl border border-cyan-500/40 text-white shadow-2xl text-xs font-bold transition-all hover:scale-105 group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="group-hover:text-cyan-300 transition-colors">Thanh Tiện Ích MediCare</span>
            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-slate-900/95 backdrop-blur-2xl border border-white/15 text-white shadow-2xl shadow-slate-950/50">
            
            {/* 1. Nút Phân Luồng Triệu Chứng */}
            <button
              type="button"
              onClick={handleOpenSymptomNavigator}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-white text-xs font-bold transition-all"
              title="Phân Luồng Triệu Chứng & Gợi Ý Chuyên Khoa"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Tra Triệu Chứng</span>
            </button>

            {/* 2. Nút Tra Cứu Số Khám Nhanh */}
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === 'queue' ? null : 'queue')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all ${
                activePopover === 'queue'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200'
              }`}
              title="Tra cứu số thứ tự"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Số Khám</span>
            </button>

            {/* 3. Nút Đặt Khám 1 Chạm */}
            <button
              type="button"
              onClick={() => navigate('/patient/appointments')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-md shadow-blue-500/20"
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Khám</span>
            </button>

            {/* 4. Nút Khẩn Cấp SOS */}
            <button
              type="button"
              onClick={() => setActivePopover('sos')}
              className="relative flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-md shadow-rose-600/30 group"
              title="Cấp Cứu Khẩn Cấp 115"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>

            {/* 5. Nút Thu Gọn */}
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                setIsMinimized(true);
              }}
              title="Thu nhỏ thanh tiện ích"
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

          </div>
        )}
      </aside>
    </>
  );
};

export default FloatingMedicalDock;
