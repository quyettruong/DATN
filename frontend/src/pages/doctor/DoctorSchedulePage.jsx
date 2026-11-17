import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, MapPin, Building2, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../api/axios';

const DAYS_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const getWeekDates = (offset = 0) => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const fmtDate = (d) => dayjs(d).format('YYYY-MM-DD');

const getMaxCap = (schedule) => schedule?.maxSlots ?? schedule?.maxPatients ?? 20;

const SlotBadge = ({ schedule, todayStr }) => {
  const isToday = schedule.date === todayStr;
  const isFull = (schedule.bookedSlots || 0) >= getMaxCap(schedule);
  if (isToday) {
    return (
      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
        Ca hôm nay
      </span>
    );
  }
  if (isFull) {
    return (
      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
        Đã kín lịch
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
      Còn nhận khách
    </span>
  );
};

export default function DoctorSchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayStr = fmtDate(new Date());
  const weekDates = getWeekDates(weekOffset);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/doctors/my-schedules');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setSchedules(list);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const weekKeys = new Set(weekDates.map(fmtDate));
  const weekSchedules = schedules.filter(s => weekKeys.has(s.date));

  const grouped = weekDates.reduce((acc, d) => {
    const key = fmtDate(d);
    acc[key] = weekSchedules.filter(s => s.date === key);
    return acc;
  }, {});

  const weekLabel = () => {
    const from = weekDates[0];
    const to = weekDates[6];
    return `${dayjs(from).format('DD/MM')} – ${dayjs(to).format('DD/MM/YYYY')}`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 md:p-7 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-teal-400" />
            Lịch Trực & Ca Khám Trong Tuần
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Theo dõi phân công phòng khám và tỷ lệ bệnh nhân đặt lịch trước
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/15 transition-colors"
            >
              Tuần này
            </button>
          )}
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-3 py-1.5 backdrop-blur-xs">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="p-1.5 rounded-xl hover:bg-white/15 text-white transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs sm:text-sm font-bold text-white min-w-[148px] text-center">{weekLabel()}</span>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="p-1.5 rounded-xl hover:bg-white/15 text-white transition-colors"
              title="Tuần kế tiếp"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={fetchSchedules}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Tổng ca trực tuần này',
            value: weekSchedules.length,
            color: 'text-blue-700',
            bg: 'bg-white border-slate-200/80'
          },
          {
            label: 'Ca còn trống lịch hẹn',
            value: weekSchedules.filter(s => (s.bookedSlots || 0) < getMaxCap(s)).length,
            color: 'text-emerald-600',
            bg: 'bg-white border-slate-200/80'
          },
          {
            label: 'Ca đã kín lịch hẹn',
            value: weekSchedules.filter(s => (s.bookedSlots || 0) >= getMaxCap(s)).length,
            color: 'text-rose-600',
            bg: 'bg-white border-slate-200/80'
          },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-3xl p-5 border shadow-xs flex items-center justify-between`}>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              <div className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</div>
            </div>
            <Calendar className={`w-8 h-8 opacity-20 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {weekDates.map((d) => {
            const key = fmtDate(d);
            const daySchedules = grouped[key] || [];
            const isToday = key === todayStr;
            return (
              <div
                key={key}
                className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition-all ${
                  isToday ? 'border-blue-400 ring-2 ring-blue-500/15' : 'border-slate-200/80'
                }`}
              >
                {/* Day Header */}
                <div className={`px-5 py-3.5 flex items-center justify-between ${
                  isToday ? 'bg-blue-50/80' : daySchedules.length > 0 ? 'bg-slate-50' : 'bg-slate-50/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black ${
                      isToday ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                    }`}>
                      {d.getDate()}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isToday ? 'text-blue-900' : 'text-slate-800'}`}>
                        {DAYS_VI[d.getDay()]}
                        {isToday && <span className="ml-2 text-xs font-bold text-blue-600">(Hôm nay)</span>}
                      </div>
                      <div className="text-xs text-slate-400">{dayjs(d).format('DD/MM/YYYY')}</div>
                    </div>
                  </div>
                  {daySchedules.length > 0 ? (
                    <span className="text-xs text-blue-700 font-bold bg-blue-100/80 px-3 py-1 rounded-full">
                      {daySchedules.length} ca trực
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Nghỉ / Không phân ca</span>
                  )}
                </div>

                {/* Schedule Items */}
                {daySchedules.length > 0 && (
                  <div className="divide-y divide-slate-100 px-5">
                    {daySchedules.map(sch => {
                      const maxCap = getMaxCap(sch);
                      const booked = sch.bookedSlots || 0;
                      const isFull = booked >= maxCap;
                      return (
                        <div key={sch.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl font-bold">
                              <Clock size={14} className="text-blue-600 shrink-0" />
                              <span>{String(sch.startTime || '').slice(0, 5)} – {String(sch.endTime || '').slice(0, 5)}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                              {(sch.room || sch.roomName) && (
                                <span className="flex items-center gap-1.5 font-medium">
                                  <MapPin size={14} className="text-teal-600" /> {sch.room || sch.roomName}
                                </span>
                              )}
                              {(sch.department || sch.departmentName) && (
                                <span className="flex items-center gap-1.5">
                                  <Building2 size={14} className="text-slate-400" /> {sch.department || sch.departmentName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div className="flex items-center gap-1.5 text-sm bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/70">
                              <Users size={14} className={isFull ? 'text-rose-500' : 'text-blue-600'} />
                              <span className={`font-black ${isFull ? 'text-rose-600' : 'text-blue-700'}`}>
                                {booked}
                              </span>
                              <span className="text-slate-400 text-xs font-semibold">/ {maxCap} lượt</span>
                            </div>
                            <SlotBadge schedule={sch} todayStr={todayStr} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && weekSchedules.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 text-center py-12 px-6 text-slate-500">
          <Calendar size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-base font-bold text-slate-700">Chưa có ca trực được phân công trong tuần này</p>
          <p className="text-xs text-slate-400 mt-1">Bác sĩ có thể chuyển sang tuần kế tiếp hoặc liên hệ Phòng Kế hoạch Tổng hợp để cập nhật lịch trực.</p>
        </div>
      )}
    </div>
  );
}
