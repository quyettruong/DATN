import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Search, CheckCircle2, XCircle, Clock, Filter, RefreshCw, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import api from '../../api/axios';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  CHECKED_IN: { label: 'Đã check-in', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  COMPLETED: { label: 'Hoàn tất khám', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  NO_SHOW: { label: 'Vắng mặt', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const todayStr = () => dayjs().format('YYYY-MM-DD');

const isTodayDate = (dateStr) => {
  if (!dateStr) return false;
  return dateStr.split('T')[0] === todayStr();
};

const isUpcoming = (dateStr) => {
  if (!dateStr) return false;
  return dateStr.split('T')[0] > todayStr();
};

export default function StaffAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today'); // today | upcoming | all
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = dateFilter ? { date: dateFilter } : {};
      const res = await api.get('/api/appointments', { params });
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setAppointments(list);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleConfirm = async (id) => {
    setActionLoading(id + '_confirm');
    try {
      await api.post(`/api/appointments/${id}/confirm`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CONFIRMED' } : a));
      toast.success('Đã xác nhận lịch hẹn thành công!');
    } catch {
      toast.error('Xác nhận thất bại, vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    setActionLoading(id + '_cancel');
    try {
      await api.post(`/api/appointments/${id}/cancel`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
      toast.success('Đã hủy lịch hẹn.');
    } catch {
      toast.error('Hủy lịch hẹn thất bại, vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter
  const filtered = appointments.filter(a => {
    const kw = search.toLowerCase().trim();
    const matchSearch =
      !kw ||
      (a.patientName || '').toLowerCase().includes(kw) ||
      (a.doctorName || '').toLowerCase().includes(kw) ||
      (a.departmentName || a.department || '').toLowerCase().includes(kw);
    const dateStr = a.appointmentDate || a.date || '';
    const matchTab = tab === 'all'
      ? true
      : tab === 'today'
        ? isTodayDate(dateStr)
        : isUpcoming(dateStr);
    return matchSearch && matchTab;
  });

  const tabCount = (t) => appointments.filter(a => {
    const dateStr = a.appointmentDate || a.date || '';
    return t === 'all' ? true : t === 'today' ? isTodayDate(dateStr) : isUpcoming(dateStr);
  }).length;

  const tabs = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'upcoming', label: 'Sắp tới' },
    { key: 'all', label: 'Tất cả' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600"><Calendar size={22} /></span>
            <span>Quản Lý Danh Sách Lịch Hẹn</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Xác nhận đặt khám trực tuyến, chuyển tiếp check-in quầy lễ tân và điều phối giờ hẹn
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.key
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] ${tab === t.key ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
                {tabCount(t.key)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm bệnh nhân, bác sĩ, chuyên khoa..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="date"
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value);
                if (e.target.value) setTab('all');
              }}
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Calendar size={44} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm text-slate-600">Không tìm thấy lịch hẹn nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Mã LH', 'Bệnh nhân', 'Bác sĩ phụ trách', 'Chuyên khoa', 'Ngày khám', 'Giờ hẹn', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => {
                  const statusConf = STATUS_CONFIG[apt.status] || STATUS_CONFIG.PENDING;
                  const dateStr = apt.appointmentDate || apt.date || '';
                  const timeStr = (apt.startTime || apt.time || '').toString().slice(0, 5);
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-500">
                        #APPT-{String(apt.id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xs font-black shrink-0">
                            {(apt.patientName || 'B').charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{apt.patientName || '---'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{apt.doctorName || 'Chưa chỉ định'}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-blue-600">
                        {apt.departmentName || apt.department || 'Đa khoa'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-slate-700 whitespace-nowrap">
                        {dateStr ? dayjs(dateStr).format('DD/MM/YYYY') : '---'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1"><Clock size={12} className="text-slate-400" />{timeStr || '---'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          {apt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => navigate(`/staff/check-in?id=${apt.id}`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-xs"
                              title="Tiếp nhận bệnh nhân và in phiếu số thứ tự khám"
                            >
                              <UserCheck size={13} />
                              <span>Check-in</span>
                            </button>
                          )}
                          {apt.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirm(apt.id)}
                              disabled={actionLoading === apt.id + '_confirm'}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-60 transition-colors whitespace-nowrap"
                            >
                              <CheckCircle2 size={13} />
                              <span>{actionLoading === apt.id + '_confirm' ? '...' : 'Xác nhận'}</span>
                            </button>
                          )}
                          {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancel(apt.id)}
                              disabled={actionLoading === apt.id + '_cancel'}
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 disabled:opacity-60 transition-colors whitespace-nowrap"
                            >
                              <XCircle size={13} />
                              <span>{actionLoading === apt.id + '_cancel' ? '...' : 'Hủy'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">Hiển thị {filtered.length} / {appointments.length} lịch hẹn</p>
      )}
    </div>
  );
}
