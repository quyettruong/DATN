import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Play,
  FileText,
  AlertCircle,
  Stethoscope,
  RefreshCw,
  FlaskConical,
  ShieldAlert
} from 'lucide-react';

const DoctorQueuePage = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [quickNote, setQuickNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/queues/my-queue?date=${dayjs().format('YYYY-MM-DD')}`);
      const rawList = Array.isArray(res) ? res : (res?.data || []);
      const queueList = rawList.map(ticket => ({
        ...ticket,
        ticketNumber: ticket.queueNumber
      }));
      
      const inExam = queueList.find(q => q.status === 'IN_EXAM' || q.status === 'CALLED');
      if (inExam) {
        setCurrentPatient(inExam);
        setQueue(queueList.filter(q => q.id !== inExam.id && q.status === 'WAITING'));
      } else {
        setCurrentPatient(null);
        setQueue(queueList.filter(q => q.status === 'WAITING'));
      }
    } catch (err) {
      toast.error('Không thể tải danh sách hàng đợi');
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (queue.length === 0) {
      toast.error('Hàng đợi trống');
      return;
    }
    
    try {
      setActionLoading(true);
      const called = await api.post('/api/queues/call-next');
      const calledTicket = called?.data || called;
      const ticketId = calledTicket?.id;
      if (!ticketId) {
        toast.error('Không tìm thấy thông tin lượt khám');
        return;
      }
      const started = await api.post(`/api/queues/${ticketId}/start-exam`);
      const startedTicket = started?.data || started;
      setCurrentPatient({ ...startedTicket, ticketNumber: startedTicket.queueNumber });
      setQuickNote('');
      await fetchQueue();
      toast.success(`Đang gọi số ${startedTicket.queueNumber} - ${startedTicket.patientName || ''}`);
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi gọi số');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentPatient) return;
    
    try {
      setActionLoading(true);
      await api.post(`/api/queues/${currentPatient.id}/complete`);
      
      toast.success('Đã hoàn thành ca khám & đồng bộ viện phí');
      setCurrentPatient(null);
      setQuickNote('');
      await fetchQueue();
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentPatient) return;
    
    if (window.confirm('Bạn có chắc chắn muốn bỏ qua bệnh nhân này?')) {
      try {
        setActionLoading(true);
        await api.post(`/api/queues/${currentPatient.id}/skip`);
        
        toast.success('Đã bỏ qua bệnh nhân');
        setCurrentPatient(null);
        setQuickNote('');
        await fetchQueue();
      } catch (err) {
        toast.error(err?.message || 'Có lỗi xảy ra');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const openExamWorkspace = () => {
    if (!currentPatient) return;
    navigate(`/doctor/examination/${currentPatient.id}`, {
      state: quickNote.trim() ? { quickNote: quickNote.trim() } : undefined
    });
  };

  const renderTriageBadge = (level) => {
    if (!level) return null;
    if (level === 'RED' || level === 'EMERGENCY') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3 h-3" /> Cấp cứu
        </span>
      );
    }
    if (level === 'YELLOW' || level === 'URGENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          Ưu tiên
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-7.5rem)] pb-6 lg:pb-0">
      
      {/* Left Column: Queue List */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden max-h-[460px] lg:max-h-none">
        <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            Hàng đợi chờ khám ({queue.length})
          </h2>
          <button 
            onClick={fetchQueue}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Đang tải hàng đợi...</div>
          ) : queue.length > 0 ? (
            queue.map((item, idx) => (
              <div key={item.id} className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 bg-white flex items-center justify-between transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-100">
                    {item.ticketNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.patientName}</p>
                      {renderTriageBadge(item.triageLevel)}
                      {item.isReturnPatient && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          <FlaskConical className="w-2.5 h-2.5" /> Đã có KQ CLS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {idx === 0 ? 'Kế tiếp vào phòng' : `Còn chờ ${idx} lượt`}
                      {item.patientCode ? ` · #${item.patientCode}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-slate-500 text-sm font-medium">Hàng đợi hiện đang trống</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={handleCallNext}
            disabled={queue.length === 0 || currentPatient !== null || actionLoading}
            className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Gọi bệnh nhân tiếp theo
          </button>
        </div>
      </div>

      {/* Right Column: Current Patient Area */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {currentPatient ? (
          <div className="flex-1 bg-white rounded-3xl shadow-xs border border-slate-200/80 flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                <h2 className="font-bold text-sm tracking-wide">Bệnh nhân đang trong phòng khám</h2>
              </div>
              <span className="bg-white/15 backdrop-blur-xs px-3.5 py-1 text-white font-black rounded-full text-xs border border-white/20">
                STT {currentPatient.ticketNumber}
              </span>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{currentPatient.patientName}</h1>
                    {currentPatient.patientCode && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        #{currentPatient.patientCode}
                      </span>
                    )}
                    {renderTriageBadge(currentPatient.triageLevel)}
                    {currentPatient.isReturnPatient && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <FlaskConical className="w-3.5 h-3.5" /> Đã có kết quả Cận lâm sàng
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Tiếp nhận lúc: {dayjs(currentPatient.calledAt || currentPatient.createdAt || new Date()).format('HH:mm - DD/MM/YYYY')}
                    {currentPatient.roomName ? ` · ${currentPatient.roomName}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lý do khám / Triệu chứng ban đầu</p>
                  <p className="text-slate-800 font-semibold text-sm">{currentPatient.reason || 'Khám chuyên khoa theo lịch hẹn'}</p>
                </div>
                <button
                  type="button"
                  onClick={openExamWorkspace}
                  className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 flex items-center justify-center gap-2.5 cursor-pointer hover:bg-blue-100/70 transition-colors group text-left"
                >
                  <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-blue-900 text-sm">Mở Bàn Khám Bệnh Án Điện Tử</p>
                    <p className="text-xs text-blue-700/80">Xem sinh hiệu điều dưỡng, chỉ định CLS & kê đơn</p>
                  </div>
                </button>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm">Ghi chú nhanh lâm sàng (Tự động chuyển sang Bàn khám)</h3>
                </div>
                <textarea 
                  className="w-full bg-white border border-amber-200 rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 h-28 text-sm text-slate-800"
                  placeholder="Nhập triệu chứng sơ bộ, lưu ý đặc biệt trước khi mở màn hình kê đơn..."
                  value={quickNote}
                  onChange={e => setQuickNote(e.target.value)}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap gap-3">
              <button
                onClick={handleSkip}
                disabled={actionLoading}
                className="px-5 py-3 border border-slate-300 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-100 flex items-center transition-colors disabled:opacity-50 text-xs"
              >
                <XCircle className="w-4 h-4 mr-1.5 text-slate-400" />
                Vắng mặt / Bỏ qua
              </button>
              
              <button
                onClick={openExamWorkspace}
                disabled={actionLoading}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xs flex items-center justify-center transition-colors disabled:opacity-50 text-xs gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Vào Khám Bệnh & Chỉ Định CLS / Kê Đơn</span>
              </button>
              
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-xs flex items-center justify-center transition-colors disabled:opacity-50 text-xs gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hoàn tất ca khám</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8 min-h-[360px]">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center shadow-2xs mb-5 border border-blue-100">
              <Play className="w-9 h-9 text-blue-600 ml-1" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Phòng khám đang sẵn sàng</h2>
            <p className="text-slate-500 text-sm max-w-md mb-6">
              Nhấn nút <strong>Gọi bệnh nhân tiếp theo</strong> để phát thông báo lên bảng điện tử ngoài hành lang và mở hồ sơ khám bệnh.
            </p>
            <button
              onClick={handleCallNext}
              disabled={queue.length === 0 || actionLoading}
              className="px-7 py-3 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Gọi bệnh nhân đầu tiên
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default DoctorQueuePage;
