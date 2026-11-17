import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import { 
  Users, 
  Activity, 
  Clock, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Bell, 
  Search, 
  CheckCircle2, 
  Hospital, 
  DoorOpen, 
  ArrowRight, 
  UserCheck, 
  Sparkles, 
  Volume2, 
  Calendar, 
  ShieldCheck, 
  QrCode,
  Tv
} from 'lucide-react';
import dayjs from 'dayjs';

const CLINIC_ROOMS = [
  { id: 1, code: 'R101', name: 'Phòng 101 - Khám Nội Tổng Quát', dept: 'Khoa Nội', floor: 'Tầng 1' },
  { id: 2, code: 'R102', name: 'Phòng 102 - Khám Tim Mạch & Huyết Áp', dept: 'Khoa Nội', floor: 'Tầng 1' },
  { id: 3, code: 'R201', name: 'Phòng 201 - Khám Ngoại & Chấn Thương', dept: 'Khoa Ngoại', floor: 'Tầng 2' },
  { id: 4, code: 'R202', name: 'Phòng 202 - Tiểu Phẫu & Bó Bột', dept: 'Khoa Ngoại', floor: 'Tầng 2' },
  { id: 5, code: 'R301', name: 'Phòng 301 - Khám Tai Mũi Họng', dept: 'Khoa TMH', floor: 'Tầng 3' },
  { id: 7, code: 'R401', name: 'Phòng 401 - Khám Răng Hàm Mặt', dept: 'Khoa RHM', floor: 'Tầng 4' },
  { id: 9, code: 'R501', name: 'Phòng 501 - Khám Mắt & Đo Thị Lực', dept: 'Khoa Mắt', floor: 'Tầng 5' },
  { id: 11, code: 'R601', name: 'Phòng 601 - Khám Da Liễu', dept: 'Khoa Da Liễu', floor: 'Tầng 6' }
];

const QueueStatusPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Tab: 'MY_QUEUE' (chỉ hiện khi login hoặc tra cứu) | 'ROOM_MONITOR' (xem theo phòng)
  const [activeTab, setActiveTab] = useState(isAuthenticated ? 'MY_QUEUE' : 'ROOM_MONITOR');
  
  // Data for authenticated patient
  const [myTicket, setMyTicket] = useState(null);
  const [loadingMyTicket, setLoadingMyTicket] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Data for room live monitor
  const [selectedRoomId, setSelectedRoomId] = useState(1);
  const [roomQueue, setRoomQueue] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);
  const [loadingRoomQueue, setLoadingRoomQueue] = useState(false);

  // Data for quick ticket lookup
  const [searchNumber, setSearchNumber] = useState('');
  const [searchedTicket, setSearchedTicket] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  // Audio notification
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  };

  // 1. Fetch personal ticket if authenticated
  const fetchMyTicket = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingMyTicket(true);
      const res = await api.get('/api/queues/my-ticket');
      const list = res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        // Tìm vé active (WAITING, CALLED, IN_EXAM)
        const active = list.find(t => ['WAITING', 'CALLED', 'IN_EXAM'].includes(t.status)) || list[0];
        
        // Phát chuông nếu vừa được gọi
        if (active && (active.status === 'CALLED' || active.status === 'IN_EXAM')) {
          if (!myTicket || myTicket.status === 'WAITING') {
            playChime();
          }
        }
        setMyTicket(active);
      } else {
        setMyTicket(null);
      }
      setLastUpdated(new Date());
    } catch (err) {
      // Không ném lỗi đỏ, chỉ set ticket = null
      setMyTicket(null);
    } finally {
      setLoadingMyTicket(false);
    }
  };

  // 2. Fetch live queue by room
  const fetchRoomQueue = async (roomId = selectedRoomId) => {
    try {
      setLoadingRoomQueue(true);
      const res = await api.get(`/api/queues/room/${roomId}?date=${dayjs().format('YYYY-MM-DD')}`);
      const list = res?.data || res || [];
      const arrayList = Array.isArray(list) ? list : [];
      
      const inExamOrCalled = arrayList.filter(t => t.status === 'IN_EXAM' || t.status === 'CALLED');
      const serving = inExamOrCalled.length > 0 ? inExamOrCalled[inExamOrCalled.length - 1] : null;
      
      const waiting = arrayList.filter(t => t.status === 'WAITING');
      
      setCurrentServing(serving);
      setRoomQueue(waiting);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Lỗi tải hàng đợi phòng:', err);
    } finally {
      setLoadingRoomQueue(false);
    }
  };

  // 3. Quick lookup by queue number
  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!searchNumber.trim()) return;
    
    try {
      setLookupLoading(true);
      setLookupMessage('');
      setSearchedTicket(null);
      
      const res = await api.get(`/api/queues/lookup?q=${encodeURIComponent(searchNumber.trim())}`);
      const list = res?.data || res || [];
      
      if (Array.isArray(list) && list.length > 0) {
        setSearchedTicket(list[0]);
      } else {
        setLookupMessage(`Không tìm thấy lượt khám nào khớp với số "${searchNumber}". Vui lòng kiểm tra lại phiếu khám.`);
      }
    } catch (err) {
      setLookupMessage('Không thể kết nối đến máy chủ tra cứu số thứ tự.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTicket();
    }
    fetchRoomQueue(selectedRoomId);

    // Auto-refresh every 8 seconds
    const interval = setInterval(() => {
      if (isAuthenticated) fetchMyTicket();
      fetchRoomQueue(selectedRoomId);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuthenticated, selectedRoomId]);

  const selectedRoomObj = CLINIC_ROOMS.find(r => r.id === selectedRoomId) || CLINIC_ROOMS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* ── Top Header ── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2 border border-blue-200/60">
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Hệ Thống Gọi Số Trực Tuyến MediCare SmartQueue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Theo Dõi Hàng Đợi & Số Thứ Tự Khám Bệnh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cập nhật thời gian thực lúc {dayjs(lastUpdated).format('HH:mm:ss')} · Tự động làm mới mỗi 8 giây
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/queue-display"
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-slate-900/10"
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>Bảng Gọi Số TV Toàn Viện</span>
          </Link>

          <button
            onClick={() => {
              if (isAuthenticated) fetchMyTicket();
              fetchRoomQueue(selectedRoomId);
            }}
            className="px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center space-x-2 transition-colors border border-blue-200/60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMyTicket || loadingRoomQueue ? 'animate-spin' : ''}`} />
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {/* ── Mode Selection Tabs ── */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs inline-flex flex-wrap gap-1">
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('MY_QUEUE')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
              activeTab === 'MY_QUEUE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Số Khám Của Tôi ({user?.fullName || 'Bệnh nhân'})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('ROOM_MONITOR')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
            activeTab === 'ROOM_MONITOR'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Theo Dõi Theo Phòng Khám</span>
        </button>

        <button
          onClick={() => setActiveTab('LOOKUP')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
            activeTab === 'LOOKUP'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Tra Cứu Nhanh Bằng Số Phiếu</span>
        </button>
      </div>

      {/* ── Unauthenticated Notice Banner (If Guest) ── */}
      {!isAuthenticated && activeTab !== 'LOOKUP' && (
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-5 rounded-3xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Bạn đang xem ở chế độ Khách vãng lai
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Đăng nhập để hệ thống tự động nhận diện và thông báo khi số thứ tự của bạn được bác sĩ gọi vào phòng.
              </p>
            </div>
          </div>
          <Link
            to="/login?redirect=/patient/queue"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm self-start sm:self-auto flex items-center space-x-1.5"
          >
            <span>Đăng Nhập Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── TAB 1: SỐ KHÁM CỦA TÔI (AUTHENTICATED) ── */}
      {activeTab === 'MY_QUEUE' && isAuthenticated && (
        <div className="space-y-6">
          {myTicket ? (
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-6 sm:p-8 rounded-3xl border-2 border-blue-200 shadow-xl relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                {/* Cột Trái: Số Thứ Tự To Đùng */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-blue-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Số Thứ Tự Của Bạn
                  </span>
                  
                  <div className="my-3 py-2 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-lg shadow-blue-500/25">
                    <p className="text-5xl sm:text-6xl font-black tracking-tight font-mono">
                      {myTicket.queueNumber}
                    </p>
                  </div>

                  {/* Badge Trạng Thái */}
                  <div className="mt-2">
                    {myTicket.status === 'CALLED' ? (
                      <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider animate-bounce shadow-md">
                        <Volume2 className="w-4 h-4" />
                        <span>Mời bạn vào phòng khám!</span>
                      </span>
                    ) : myTicket.status === 'IN_EXAM' ? (
                      <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đang trong ca khám bệnh</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Đang chờ gọi số</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-3">
                    Được cấp lúc: {dayjs(myTicket.createdAt).format('HH:mm - DD/MM/YYYY')}
                  </p>
                </div>

                {/* Cột Phải: Thông Tin Chi Tiết Ca Khám */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Điểm Tiếp Nhận</p>
                    <h2 className="text-2xl font-black text-slate-900">
                      {myTicket.roomName || 'Phòng Khám Nội Tổng Quát'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Bác sĩ khám: <span className="font-bold text-slate-800">{myTicket.doctorName || 'Bác sĩ điều trị MediCare'}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Bệnh nhân</p>
                      <p className="text-sm font-black text-slate-800 mt-0.5 truncate">{myTicket.patientName}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Ước tính chờ</p>
                      <p className="text-sm font-black text-blue-600 mt-0.5">
                        ~{myTicket.estimatedWaitMinutes || 15} phút
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Số ưu tiên ESI</p>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">
                        Điểm: {myTicket.priorityScore || 50}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Bell size={14} className="text-blue-600" />
                      <span>Hướng dẫn dành cho bạn:</span>
                    </p>
                    <p className="leading-relaxed">
                      Vui lòng ngồi tại ghế chờ trước cửa <strong>{myTicket.roomName}</strong>. Khi loa phát thanh hoặc màn hình nhảy số của bạn, hãy bước vào phòng khám gặp bác sĩ.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <Users size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Hôm nay bạn chưa có lượt xếp hàng nào
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Để nhận số thứ tự khám bệnh, bạn có thể Đặt Lịch Khám Trực Tuyến trước hoặc quét mã QR / nhận phiếu tại Quầy Tiếp Nhận của bệnh viện.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link
                  to="/patient/appointments"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Đặt Lịch Khám Ngay
                </Link>
                <button
                  onClick={() => setActiveTab('ROOM_MONITOR')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                >
                  Xem Bảng Số Các Phòng Khám
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: THEO DÕI THEO PHÒNG KHÁM (LIVE ROOM MONITOR) ── */}
      {activeTab === 'ROOM_MONITOR' && (
        <div className="space-y-6">
          
          {/* Room Selector Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chọn Phòng Khám Cần Theo Dõi:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
              {CLINIC_ROOMS.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedRoomId === room.id
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/30'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-black text-slate-900 truncate">{room.code} · {room.dept}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{room.floor}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Display Card for Selected Room */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 bg-white/10 rounded-full text-cyan-300 text-xs font-black uppercase tracking-wider">
                  Trực tiếp tại phòng
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                  {selectedRoomObj.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Khoa chuyên môn: {selectedRoomObj.dept} · Vị trí: {selectedRoomObj.floor}
                </p>
              </div>

              {/* Bảng số to đùng */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl text-center min-w-[200px] shadow-inner">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                  Đang Khám / Đang Gọi
                </p>
                <p className="text-5xl sm:text-6xl font-black text-cyan-300 my-1 font-mono tracking-tight">
                  {currentServing ? currentServing.queueNumber : '---'}
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[180px] mx-auto">
                  {currentServing ? currentServing.patientName : 'Chưa có bệnh nhân'}
                </p>
              </div>
            </div>

            {/* Danh Sách 6 Số Tiếp Theo Đang Chờ */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-400" />
                  <span>Các Số Kế Tiếp Đang Chờ Vào Phòng ({roomQueue.length})</span>
                </h3>
                <span className="text-[11px] text-slate-500">Cập nhật liên tục</span>
              </div>

              {roomQueue.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {roomQueue.slice(0, 6).map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center space-y-1 hover:border-cyan-400/50 transition-colors"
                    >
                      <span className="text-[10px] text-slate-400 font-bold">
                        Vị trí #{idx + 1}
                      </span>
                      <p className="text-2xl font-black text-white font-mono">
                        {item.queueNumber}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.patientName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-800/40 rounded-2xl text-center border border-slate-800 text-xs text-slate-400">
                  Hiện không có bệnh nhân nào trong hàng chờ của phòng khám này.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 3: TRA CỨU NHANH BẰNG SỐ PHIẾU KHÁM ── */}
      {activeTab === 'LOOKUP' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Search size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Tra Cứu Trạng Thái Số Thứ Tự
              </h2>
              <p className="text-xs text-slate-500">
                Nhập số thứ tự in trên phiếu khám (VD: 001, W001...) để kiểm tra vị trí hiện tại
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập số thứ tự..."
                value={searchNumber}
                onChange={e => setSearchNumber(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
              >
                {lookupLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>Tra Cứu</span>
              </button>
            </form>

            {lookupMessage && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                <span>{lookupMessage}</span>
              </div>
            )}

            {searchedTicket && (
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Kết quả tra cứu:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    searchedTicket.status === 'CALLED'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : searchedTicket.status === 'IN_EXAM'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {searchedTicket.status === 'CALLED' ? 'Mời vào khám' : searchedTicket.status === 'IN_EXAM' ? 'Đang khám' : 'Đang chờ'}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-black font-mono text-blue-600">
                    {searchedTicket.queueNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{searchedTicket.patientName}</h3>
                    <p className="text-xs text-slate-600">{searchedTicket.roomName}</p>
                    <p className="text-[11px] text-slate-400">Bác sĩ: {searchedTicket.doctorName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default QueueStatusPage;
