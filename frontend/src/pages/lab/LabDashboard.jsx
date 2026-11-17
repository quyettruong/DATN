import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Activity,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Microscope
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import dayjs from 'dayjs';

const LabDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabSummary();
  }, []);

  const fetchLabSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/lab-orders');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setOrders(list);
    } catch (e) {
      console.error('Lỗi tải tổng quan xét nghiệm:', e);
    } finally {
      setLoading(false);
    }
  };

  const pending = orders.filter(o => o.status === 'ORDERED').length;
  const processing = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const completed = orders.filter(o => o.status === 'COMPLETED').length;
  const abnormal = orders.filter(o => o.isAbnormal).length;

  const pieData = [
    { name: 'Chờ lấy mẫu', value: pending },
    { name: 'Đang phân tích', value: processing },
    { name: 'Đã trả kết quả', value: completed }
  ];
  const hasAny = pending + processing + completed > 0;
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0))
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold border border-white/10 mb-2.5">
            <Microscope className="w-3.5 h-3.5" />
            <span>Trung Tâm Xét Nghiệm Cận Lâm Sàng (LIS)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Tổng Quan Khoa Cận Lâm Sàng</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Ca trực ngày {dayjs().format('DD/MM/YYYY')} · Tiếp nhận bệnh phẩm, phân tích chỉ số sinh hóa và huyết học
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/lab/orders"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Xử Lý Phiếu Xét Nghiệm</span>
          </Link>
          <button
            onClick={fetchLabSummary}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chờ Lấy Mẫu</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{pending}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Phiếu mới từ bác sĩ</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang Chạy Máy</p>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{processing}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Đang phân tích mẫu</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
            <Activity size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã Trả Kết Quả</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{completed}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Đã đồng bộ về phòng khám</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chỉ Số Bất Thường</p>
            <h3 className="text-3xl font-black text-rose-600 mt-1">{abnormal}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Cảnh báo đỏ cho bác sĩ</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Chart + Recent Real Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80">
          <h2 className="text-base font-black text-slate-900 mb-1">Cơ Cấu Tiến Độ Xét Nghiệm</h2>
          <p className="text-xs text-slate-400 mb-4">Tổng số {orders.length} chỉ định cận lâm sàng trên hệ thống</p>
          <div className="h-64">
            {hasAny ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={84}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <FlaskConical className="w-10 h-10 text-slate-200 mb-2" />
                <span>Chưa phát sinh phiếu chỉ định xét nghiệm nào</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-900">Phiếu Chỉ Định Mới Nhất</h2>
              <p className="text-xs text-slate-400">Dữ liệu thực tế từ các phòng khám chuyên khoa</p>
            </div>
            <Link to="/lab/orders" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4 flex-1">
            {recentOrders.length > 0 ? (
              <div className="space-y-2.5">
                {recentOrders.map((item) => {
                  const statusBadge = item.status === 'COMPLETED'
                    ? { text: 'Đã trả KQ', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                    : item.status === 'IN_PROGRESS'
                    ? { text: 'Đang chạy máy', cls: 'bg-blue-50 text-blue-700 border-blue-200' }
                    : { text: 'Chờ lấy mẫu', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
                  return (
                    <Link
                      key={item.id}
                      to={item.status === 'COMPLETED' ? '/lab/results' : item.status === 'IN_PROGRESS' ? '/lab/processing' : '/lab/orders'}
                      className="flex justify-between items-center p-3.5 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 flex-shrink-0">
                          <FlaskConical size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {item.patientName} {item.patientCode ? `(${item.patientCode})` : ''}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {item.testName} · BS. {item.doctorName || 'Điều trị'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ml-2 ${statusBadge.cls}`}>
                        {statusBadge.text}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs">
                <CheckCircle2 className="w-10 h-10 text-slate-200 mb-2" />
                <span>Hiện không có mẫu bệnh phẩm nào đang chờ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
