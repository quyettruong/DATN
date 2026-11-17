import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Users,
  UserPlus,
  FileText,
  Activity,
  DollarSign,
  HeartPulse,
  Pill,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import api from '../../api/axios';

const StaffDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    checkedIn: 0,
    appointments: 0,
    unpaidInvoices: 0,
    pendingTriage: 0,
    pendingPrescriptions: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const [dashRes, billRes, triageRes, rxRes, hourlyRes] = await Promise.allSettled([
        api.get('/api/stats/dashboard'),
        api.get('/api/billing/invoices/unpaid'),
        api.get('/api/triage/pending'),
        api.get('/api/pharmacy/prescriptions?status=PRESCRIBED'),
        api.get(`/api/stats/appointments/hourly?date=${today}`)
      ]);

      const dash = dashRes.status === 'fulfilled' ? (dashRes.value?.data || dashRes.value) : null;
      const bills = billRes.status === 'fulfilled' ? (billRes.value?.data || billRes.value || []) : [];
      const triages = triageRes.status === 'fulfilled' ? (triageRes.value?.data || triageRes.value || []) : [];
      const rxs = rxRes.status === 'fulfilled' ? (rxRes.value?.data || rxRes.value || []) : [];
      const hourly = hourlyRes.status === 'fulfilled' ? (hourlyRes.value?.data || hourlyRes.value || []) : [];

      setStats({
        checkedIn: Number(dash?.todayCheckedIn ?? 0),
        appointments: Number(dash?.todayAppointments ?? 0),
        unpaidInvoices: Array.isArray(bills) ? bills.length : Number(dash?.pendingInvoices ?? 0),
        pendingTriage: Array.isArray(triages) ? triages.length : 0,
        pendingPrescriptions: Array.isArray(rxs) ? rxs.length : Number(dash?.pendingPrescriptions ?? 0)
      });

      if (Array.isArray(hourly) && hourly.length > 0) {
        setChartData(hourly.map(h => ({
          hour: typeof h.hour === 'number' ? `${String(h.hour).padStart(2, '0')}:00` : h.hour,
          count: Number(h.count ?? 0)
        })));
      } else {
        setChartData([
          { hour: '08:00', count: 0 },
          { hour: '09:00', count: 0 },
          { hour: '10:00', count: 0 },
          { hour: '11:00', count: 0 },
          { hour: '13:00', count: 0 },
          { hour: '14:00', count: 0 },
          { hour: '15:00', count: 0 },
          { hour: '16:00', count: 0 },
        ]);
      }
    } catch (e) {
      console.error('Lỗi tải dữ liệu bàn tiếp nhận:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold border border-white/10 mb-2.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Quầy Tiếp Nhận · Điều Dưỡng · Thu Ngân · Dược</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Xin chào, {user?.fullName || 'Nhân viên y tế'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Ca trực ngày {dayjs().format('DD/MM/YYYY')} · Dữ liệu đồng bộ thời gian thực từ hệ thống HIS
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/staff/check-in"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tiếp Nhận Bệnh Nhân</span>
          </Link>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã Check-in Hôm Nay</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.checkedIn}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Lượt phát số hàng đợi</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Lịch Đặt Hôm Nay</p>
            <h3 className="text-3xl font-black text-indigo-600 mt-1">{stats.appointments}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Bao gồm đặt trước & vãng lai</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Calendar size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chờ Đo Sinh Hiệu</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.pendingTriage}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Bệnh nhân chờ phân loại</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
            <HeartPulse size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn Thuốc Chờ Phát</p>
            <h3 className="text-3xl font-black text-teal-600 mt-1">{stats.pendingPrescriptions}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Tại quầy Dược ngoại trú</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-teal-50 text-teal-600">
            <Pill size={22} />
          </div>
        </div>
      </div>

      {/* Actionable Operational Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/staff/billing"
          className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 flex items-center justify-between hover:bg-amber-50 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
              <DollarSign size={22} />
            </div>
            <div>
              <h3 className="font-black text-amber-950 text-sm">Quầy Thu Ngân Viện Phí</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                <strong>{stats.unpaidInvoices}</strong> hóa đơn đang chờ thanh toán
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/staff/triage"
          className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 flex items-center justify-between hover:bg-rose-50 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
              <HeartPulse size={22} />
            </div>
            <div>
              <h3 className="font-black text-rose-950 text-sm">Phân Loại & Sinh Hiệu</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                <strong>{stats.pendingTriage}</strong> ca cần đo huyết áp, SpO2
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/staff/pharmacy"
          className="bg-teal-50/70 border border-teal-200 rounded-3xl p-5 flex items-center justify-between hover:bg-teal-50 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl">
              <Pill size={22} />
            </div>
            <div>
              <h3 className="font-black text-teal-950 text-sm">Quầy Cấp Phát Thuốc</h3>
              <p className="text-xs text-teal-700 mt-0.5">
                <strong>{stats.pendingPrescriptions}</strong> đơn chờ xuất kho FEFO
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6">
          <div className="mb-5">
            <h2 className="text-base font-black text-slate-900">Lưu Lượng Đặt Khám Theo Khung Giờ Hôm Nay</h2>
            <p className="text-xs text-slate-400 mt-0.5">Giúp điều phối nhân sự tiếp nhận tại các khung giờ cao điểm</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" name="Số lịch hẹn" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 mb-1">Phân Hệ Nghiệp Vụ Nhanh</h2>
            <p className="text-xs text-slate-400 mb-4">Truy cập nhanh các màn hình điều phối</p>
            <div className="space-y-2.5">
              <Link to="/staff/check-in" className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl hover:bg-blue-100/70 transition-colors">
                <div className="flex items-center text-blue-700 font-bold text-xs">
                  <UserPlus className="mr-3" size={18} /> Tiếp nhận & Phát số thứ tự
                </div>
                <ChevronRight size={16} className="text-blue-500" />
              </Link>
              <Link to="/staff/appointments" className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center text-slate-700 font-bold text-xs">
                  <FileText className="mr-3 text-slate-500" size={18} /> Quản lý danh sách lịch hẹn
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
              <Link to="/staff/queue-board" className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center text-slate-700 font-bold text-xs">
                  <Activity className="mr-3 text-emerald-600" size={18} /> Giám sát hàng đợi các phòng
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
              <Link
                to="/queue-display"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl hover:bg-indigo-100/70 transition-colors"
              >
                <div className="flex items-center text-indigo-700 font-bold text-xs">
                  <ExternalLink className="mr-3" size={18} /> Mở màn hình gọi số TV sảnh chờ
                </div>
                <ChevronRight size={16} className="text-indigo-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
