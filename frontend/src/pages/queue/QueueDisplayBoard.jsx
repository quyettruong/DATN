import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import dayjs from 'dayjs';

const QueueDisplayBoard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get('roomId') || '1';
  
  const [rooms, setRooms] = useState([]);
  const [queues, setQueues] = useState([]);
  const [currentCalling, setCurrentCalling] = useState(null);
  const [previousCallingId, setPreviousCallingId] = useState(null);
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const deptRes = await api.get('/api/departments');
        const depts = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);
        const roomLists = await Promise.all(
          depts.slice(0, 6).map(d => api.get(`/api/departments/${d.id}/rooms`).catch(() => ({ data: [] })))
        );
        const allRooms = roomLists.flatMap((r, idx) => {
          const arr = Array.isArray(r) ? r : (r?.data || []);
          return arr.map(rm => ({ ...rm, deptName: depts[idx]?.name }));
        });
        setRooms(allRooms);
      } catch (e) {}
    };
    loadRooms();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get(`/api/queues/room/${roomId}?date=${dayjs().format('YYYY-MM-DD')}`);
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      
      // Hiển thị cả ca ĐÃ GỌI (CALLED) và ĐANG KHÁM (IN_EXAM) để màn hình TV không bị trống khi bác sĩ bắt đầu khám
      const activeList = data.filter(q => q.status === 'CALLED' || q.status === 'IN_EXAM');
      const nowServing = activeList.find(q => q.status === 'CALLED') || activeList[activeList.length - 1] || null;
      
      if (nowServing && nowServing.id !== previousCallingId) {
        playBeep();
        setPreviousCallingId(nowServing.id);
      }
      
      const waitingOnly = data.filter(q => q.status === 'WAITING' && q.id !== nowServing?.id);
      setCurrentCalling(nowServing);
      setQueues(waitingOnly.slice(0, 8));
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [roomId, previousCallingId]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const currentRoomObj = rooms.find(r => String(r.id) === String(roomId));

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-3 shadow-lg border-b border-slate-800">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-xl font-black shadow-md">
            +
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
              Bảng Gọi Số Khám Bệnh
            </h1>
            <p className="text-xs text-teal-400 font-semibold">
              Bệnh viện Đa khoa Quốc tế MediCare {currentRoomObj ? `· ${currentRoomObj.name} (${currentRoomObj.deptName || ''})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {rooms.length > 0 && (
            <select
              value={roomId}
              onChange={(e) => setSearchParams({ roomId: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              {rooms.map(rm => (
                <option key={rm.id} value={rm.id}>
                  Phòng {rm.name} {rm.deptName ? `– ${rm.deptName}` : ''}
                </option>
              ))}
            </select>
          )}
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {dayjs(time).format('HH:mm:ss')}
            </div>
            <div className="text-xs text-slate-400">
              {dayjs(time).format('DD/MM/YYYY')}
            </div>
          </div>
          <button 
            onClick={toggleFullScreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
            title="Chế độ toàn màn hình TV"
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6">
        {/* Left: Now Serving */}
        <div className="w-full lg:w-3/5 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400" />
          
          <span className="px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-6">
            {currentCalling?.status === 'CALLED' ? '🔔 Mời bệnh nhân vào phòng' : '🩺 Đang phục vụ trong phòng'}
          </span>
          
          {currentCalling ? (
            <div className="flex flex-col items-center text-center animate-pulse-glow">
              <div className="text-7xl sm:text-8xl xl:text-[136px] font-black text-amber-400 leading-none drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                {currentCalling.queueNumber}
              </div>
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mt-6 mb-2">
                Phòng {currentCalling.roomName || currentRoomObj?.name || roomId}
              </div>
              <div className="text-base sm:text-xl text-slate-300 font-medium">
                Bác sĩ phụ trách: <span className="text-sky-300 font-bold">{currentCalling.doctorName || 'Bác sĩ trực'}</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-teal-300 mt-5 border border-teal-500/40 bg-teal-950/60 px-6 py-2.5 rounded-2xl">
                {currentCalling.patientName}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-3xl sm:text-5xl font-black text-slate-600">
                Phòng khám sẵn sàng
              </div>
              <p className="text-slate-500 text-sm sm:text-base">Vui lòng làm thủ tục tiếp nhận tại quầy để nhận số thứ tự</p>
            </div>
          )}
        </div>

        {/* Right: Next in line */}
        <div className="w-full lg:w-2/5 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-200 uppercase tracking-wider">
              Bệnh nhân kế tiếp
            </h2>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
              {queues.length} lượt chờ
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {queues.length > 0 ? (
              queues.map((q, idx) => (
                <div key={q.id} className="flex justify-between items-center bg-slate-800/70 px-4 py-3.5 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center gap-3.5">
                    <span className="text-lg sm:text-xl font-bold text-slate-400 w-7">{idx + 1}.</span>
                    <span className="text-2xl sm:text-3xl font-black text-white">{q.queueNumber}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-lg font-bold text-sky-300">{q.patientName}</div>
                    {q.isReturnPatient && (
                      <span className="text-[10px] font-bold text-teal-300 uppercase">Đã có KQ CLS</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-base sm:text-lg py-12">
                Hiện không có bệnh nhân đang chờ ngoài hành lang
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer notice */}
      <div className="bg-blue-950/90 border-t border-blue-900 text-blue-100 px-6 py-3 text-center text-xs sm:text-sm font-medium">
        Quý khách vui lòng chuẩn bị sẵn Vé Khám QR / CCCD / Thẻ BHYT và theo dõi màn hình trước cửa phòng khám. Xin trân trọng cảm ơn!
      </div>
    </div>
  );
};

export default QueueDisplayBoard;
