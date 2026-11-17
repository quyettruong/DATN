import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Monitor, Volume2, Maximize, Clock, RefreshCw, DoorOpen, Users, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

const QueueBoardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [queueData, setQueueData] = useState({
    currentlyServing: null,
    nextInLine: [],
    completedCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live ticking clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  // Load real rooms from backend departments
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const deptRes = await api.get('/api/departments');
        const depts = Array.isArray(deptRes) ? deptRes : (Array.isArray(deptRes?.data) ? deptRes.data : []);
        const roomPromises = depts.map(d =>
          api.get(`/api/departments/${d.id}/rooms`)
            .then(rRes => {
              const rList = Array.isArray(rRes) ? rRes : (Array.isArray(rRes?.data) ? rRes.data : []);
              return rList.map(r => ({
                id: r.id,
                name: `${r.name || r.roomName || `Phòng ${r.id}`} — ${d.name}`,
                shortName: r.name || r.roomName || `P.${r.id}`,
                deptName: d.name
              }));
            })
            .catch(() => [])
        );
        const nested = await Promise.all(roomPromises);
        const flat = nested.flat();
        if (flat.length > 0) {
          setRooms(flat);
          setSelectedRoomId(flat[0].id);
        } else {
          const fallback = [{ id: 1, name: 'R101 — Nội tổng quát', shortName: 'R101', deptName: 'Nội tổng quát' }];
          setRooms(fallback);
          setSelectedRoomId(1);
        }
      } catch (e) {
        const fallback = [{ id: 1, name: 'R101 — Nội tổng quát', shortName: 'R101', deptName: 'Nội tổng quát' }];
        setRooms(fallback);
        setSelectedRoomId(1);
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    fetchQueueData(true);
    const interval = setInterval(() => fetchQueueData(false), 8000);
    return () => clearInterval(interval);
  }, [selectedRoomId]);

  const fetchQueueData = async (showSpinner = false) => {
    if (!selectedRoomId) return;
    if (showSpinner) setLoading(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const res = await api.get(`/api/queues/room/${selectedRoomId}?date=${today}`);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

      const active = list.find(t => t.status === 'CALLED' || t.status === 'IN_EXAM') || null;
      const waiting = list.filter(t => t.status === 'WAITING');
      const completed = list.filter(t => t.status === 'COMPLETED').length;

      setQueueData({
        currentlyServing: active
          ? {
              number: active.queueNumber,
              name: active.patientName,
              doctorName: active.doctorName,
              status: active.status
            }
          : null,
        nextInLine: waiting.map(w => ({
          id: w.id,
          number: w.queueNumber,
          name: w.patientName,
          isReturnPatient: w.isReturnPatient,
          triageLevel: w.triageLevel
        })),
        completedCount: completed
      });
    } catch (err) {
      console.error('Lỗi tải hàng đợi phòng khám:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6' : 'min-h-[calc(100vh-9rem)] space-y-5'}`}>
      {/* Header Controls */}
      <div className={`flex flex-wrap justify-between items-center gap-3 rounded-3xl p-4 border ${
        isFullscreen ? 'bg-slate-900 border-slate-800 text-white mb-5' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <DoorOpen className={`w-5 h-5 ${isFullscreen ? 'text-cyan-400' : 'text-blue-600'}`} />
            <select 
              value={selectedRoomId || ''}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
              className={`text-sm sm:text-base font-black rounded-2xl border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isFullscreen ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'
              }`}
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          
          <div className={`flex items-center text-xs font-bold px-3.5 py-2 rounded-2xl ${
            isFullscreen ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
          }`}>
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{currentTime.format('DD/MM/YYYY · HH:mm:ss')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchQueueData(true)}
            className={`p-2.5 rounded-xl transition-colors ${
              isFullscreen ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Làm mới ngay"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={toggleFullscreen}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
              isFullscreen ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Maximize className="w-4 h-4" />
            <span>{isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</span>
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">
        
        {/* Left Col - Current Serving */}
        <div className={`lg:col-span-2 rounded-3xl p-8 flex flex-col justify-center items-center border-2 ${
          isFullscreen ? 'bg-slate-900 border-cyan-500/40' : 'bg-white border-blue-200/80 shadow-xs'
        }`}>
          <div className="text-center w-full max-w-xl">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${
              isFullscreen ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{queueData.currentlyServing?.status === 'IN_EXAM' ? 'Đang Khám Trong Phòng' : 'Đang Gọi Vào Khám'}</span>
            </span>
            
            {queueData.currentlyServing ? (
              <div className="space-y-4">
                <div className={`text-7xl sm:text-9xl font-black tracking-tight leading-none font-mono ${
                  isFullscreen ? 'text-cyan-400 animate-pulse-glow' : 'text-blue-600'
                }`}>
                  {queueData.currentlyServing.number}
                </div>
                <div className={`text-2xl sm:text-4xl font-black ${isFullscreen ? 'text-white' : 'text-slate-900'}`}>
                  {queueData.currentlyServing.name}
                </div>
                {queueData.currentlyServing.doctorName && (
                  <p className={`text-sm font-bold ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
                    Phụ trách: {queueData.currentlyServing.doctorName}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <Monitor className={`w-20 h-20 mb-3 opacity-25 ${isFullscreen ? 'text-white' : 'text-slate-600'}`} />
                <p className={`text-lg font-bold ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
                  Phòng khám đang sẵn sàng tiếp nhận lượt kế tiếp
                </p>
              </div>
            )}
            
            <div className={`mt-10 inline-flex items-center px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold ${
              isFullscreen ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-200/80'
            }`}>
              <Volume2 className="w-5 h-5 mr-2.5 text-blue-500 flex-shrink-0" />
              <span>
                {queueData.currentlyServing
                  ? `Xin mời bệnh nhân số ${queueData.currentlyServing.number} vào phòng khám`
                  : 'Quý khách vui lòng chuẩn bị sẵn thẻ BHYT / mã QR khi đến lượt'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col - Next in line */}
        <div className={`rounded-3xl flex flex-col overflow-hidden border ${
          isFullscreen ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black uppercase tracking-wider">Danh Sách Chờ Kế Tiếp</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-cyan-300">
              {queueData.nextInLine.length} ca
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {queueData.nextInLine.length > 0 ? queueData.nextInLine.map((person, idx) => (
              <div
                key={person.id || idx}
                className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                  isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/80 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-mono text-lg font-black flex-shrink-0">
                    {person.number}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-bold text-sm truncate ${isFullscreen ? 'text-white' : 'text-slate-900'}`}>
                      {person.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {idx === 0 ? 'Chuẩn bị vào khám' : `Còn ${idx} lượt phía trước`}
                    </p>
                  </div>
                </div>
                {person.isReturnPatient && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 text-[10px] font-black border border-teal-500/30">
                    Đã có KQ CLS
                  </span>
                )}
              </div>
            )) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                <CheckCircle2 className="w-10 h-10 text-slate-200 mb-2" />
                <span>Hiện không có bệnh nhân đang chờ tại phòng này</span>
              </div>
            )}
          </div>
          
          <div className={`px-6 py-4 border-t flex justify-between items-center text-xs ${
            isFullscreen ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
          }`}>
            <span className="font-bold uppercase tracking-wider">Đã hoàn tất khám hôm nay:</span>
            <span className={`text-lg font-black ${isFullscreen ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {queueData.completedCount} ca
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QueueBoardPage;
