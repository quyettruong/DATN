import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, User, AlertCircle, CheckCircle2, Stethoscope, CalendarPlus } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../api/axios';

const getDateValue = (item) => item?.scheduledDate || item?.followUpDate || item?.date || '';

const getUrgency = (dateStr) => {
  if (!dateStr) return 'normal';
  const followDate = String(dateStr).split('T')[0];
  const today = dayjs().format('YYYY-MM-DD');
  if (followDate < today) return 'overdue';
  const diff = dayjs(followDate).diff(dayjs(today), 'day');
  if (diff <= 7) return 'soon';
  return 'normal';
};

const URGENCY_CONFIG = {
  overdue: {
    border: 'border-rose-200',
    bg: 'bg-rose-50/60',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    badgeLabel: 'Quá hạn tái khám',
    icon: AlertCircle,
    iconColor: 'text-rose-600',
  },
  soon: {
    border: 'border-amber-200',
    bg: 'bg-amber-50/60',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeLabel: 'Sắp đến hẹn (≤ 7 ngày)',
    icon: Clock,
    iconColor: 'text-amber-600',
  },
  normal: {
    border: 'border-slate-200/80',
    bg: 'bg-white',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeLabel: 'Đúng lộ trình',
    icon: CheckCircle2,
    iconColor: 'text-teal-600',
  },
};

const STATUS_LABEL = {
  SCHEDULED: 'Đã lên lịch',
  COMPLETED: 'Đã tái khám',
  CANCELLED: 'Đã hủy',
  MISSED: 'Quá hẹn'
};

const EmptyState = () => (
  <div className="bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 border border-teal-100">
      <CalendarCheck size={30} className="text-teal-600" />
    </div>
    <h3 className="text-base font-black text-slate-800 mb-1">Chưa có lịch hẹn tái khám nào</h3>
    <p className="text-xs text-slate-500 max-w-sm mb-5">
      Sau mỗi đợt điều trị, bác sĩ sẽ chỉ định ngày tái khám định kỳ và hệ thống sẽ tự động hiển thị tại đây.
    </p>
    <Link
      to="/patient/appointments"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
    >
      <CalendarPlus size={15} />
      Đặt lịch khám mới
    </Link>
  </div>
);

const FollowUpCard = ({ item }) => {
  const dateStr = getDateValue(item);
  const urgency = getUrgency(dateStr);
  const conf = URGENCY_CONFIG[urgency];
  const UrgencyIcon = conf.icon;
  const displayDate = dateStr
    ? dayjs(dateStr).format('DD/MM/YYYY')
    : 'Chưa xác định ngày';

  return (
    <div className={`rounded-3xl border ${conf.border} ${conf.bg} p-5 sm:p-6 transition-all shadow-xs hover:shadow-md`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1">
          <div className={`mt-0.5 p-2.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs ${conf.iconColor}`}>
            <UrgencyIcon size={20} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-black text-slate-900 text-base">Ngày hẹn: {displayDate}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${conf.badge}`}>
                {conf.badgeLabel}
              </span>
              {item.status && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {STATUS_LABEL[item.status] || item.status}
                </span>
              )}
            </div>

            {item.reason && (
              <p className="text-sm text-slate-600 mb-1.5 flex items-start gap-1.5">
                <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <span><strong className="text-slate-700">Mục đích tái khám:</strong> {item.reason}</span>
              </p>
            )}

            {item.notes && (
              <p className="text-sm text-slate-600 mb-2 flex items-start gap-1.5">
                <Stethoscope size={14} className="text-teal-600 mt-0.5 shrink-0" />
                <span><strong className="text-slate-700">Lời dặn của bác sĩ:</strong> {item.notes}</span>
              </p>
            )}

            {item.doctorName && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                <User size={13} className="text-blue-600" />
                Bác sĩ chỉ định: <strong className="text-slate-800">{item.doctorName}</strong>
              </p>
            )}
          </div>
        </div>

        <Link
          to={`/patient/appointments${dateStr ? `?date=${encodeURIComponent(String(dateStr).split('T')[0])}` : ''}`}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-2xs shrink-0"
        >
          <CalendarPlus size={14} />
          Đặt lịch tái khám
        </Link>
      </div>
    </div>
  );
};

export default function FollowUpPage() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowUps = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/follow-ups/my');
        const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setFollowUps(data);
      } catch (err) {
        setFollowUps([]);
        setError('Không thể tải dữ liệu lịch tái khám.');
      } finally {
        setLoading(false);
      }
    };
    fetchFollowUps();
  }, []);

  const overdue = followUps.filter(f => getUrgency(getDateValue(f)) === 'overdue').length;
  const soon = followUps.filter(f => getUrgency(getDateValue(f)) === 'soon').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-teal-300 text-xs font-bold mb-2">
            <CalendarCheck size={14} /> Chăm sóc liên tục sau điều trị
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Lịch Hẹn Tái Khám Của Bạn</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Theo dõi lời dặn của bác sĩ và chủ động đặt khung giờ tái khám đúng lộ trình điều trị
          </p>
        </div>
        <Link
          to="/patient/appointments"
          className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-blue-50 rounded-2xl text-xs font-black transition shadow-sm shrink-0"
        >
          <CalendarPlus size={16} className="text-blue-600" />
          Đặt lịch khám mới
        </Link>
      </div>

      {/* Summary badges */}
      {!loading && followUps.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <CalendarCheck size={15} className="text-teal-600" />
            <span className="text-xs font-semibold text-slate-600">Tổng số lịch hẹn: <strong className="text-slate-900">{followUps.length}</strong></span>
          </div>
          {soon > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-200">
              <Clock size={15} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">Sắp đến hẹn: <strong>{soon}</strong></span>
            </div>
          )}
          {overdue > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-200">
              <AlertCircle size={15} className="text-rose-600" />
              <span className="text-xs font-semibold text-rose-700">Quá hạn: <strong>{overdue}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center">
          <AlertCircle size={36} className="text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 font-semibold text-sm">{error}</p>
        </div>
      ) : followUps.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {[...followUps].sort((a, b) => getDateValue(a).localeCompare(getDateValue(b))).map((item, idx) => (
            <FollowUpCard key={item.id || idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
