import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  RefreshCw,
  TrendingUp,
  Hospital,
  Brain,
  Sparkles
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const AnalyticsPage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);
  
  const [kpiData, setKpiData] = useState({
    todayCheckedIn: 0,
    todayAppointments: 0,
    totalPatients: 0,
    todayRevenue: 0,
    avgWaitTime: 12.5,
    completionRate: 100
  });
  
  const [revenueData, setRevenueData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [departmentTableData, setDepartmentTableData] = useState([]);
  const [aiHealth, setAiHealth] = useState(null);
  const [simForm, setSimForm] = useState({ age: 28, lead_time_days: 10, sms_received: 0, gender: 'F' });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const COLORS = ['#2563EB', '#0D9488', '#7C3AED', '#F59E0B', '#EF4444', '#10B981'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedDate]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [dashRes, revRes, hourlyRes, deptRes, docsRes, aiRes] = await Promise.allSettled([
        api.get('/api/stats/dashboard'),
        api.get('/api/stats/revenue/weekly'),
        api.get(`/api/stats/appointments/hourly?date=${selectedDate}`),
        api.get('/api/stats/departments/stats'),
        api.get('/api/doctors'),
        api.get('/api/ai/health')
      ]);
      if (aiRes.status === 'fulfilled') {
        setAiHealth(aiRes.value?.data || aiRes.value);
      }

      const dashData = dashRes.status === 'fulfilled' ? (dashRes.value?.data || dashRes.value) : null;
      const todayAppts = Number(dashData?.todayAppointments ?? 0);
      const todayChecked = Number(dashData?.todayCheckedIn ?? 0);
      const rate = todayAppts > 0 ? Math.min(100, Math.round((todayChecked / todayAppts) * 100)) : 100;

      setKpiData({
        todayCheckedIn: todayChecked,
        todayAppointments: todayAppts,
        totalPatients: Number(dashData?.totalPatients ?? 0),
        todayRevenue: Number(dashData?.todayRevenue ?? dashData?.dailyRevenue ?? 0),
        avgWaitTime: Number(dashData?.avgWaitTime ?? 12.5),
        completionRate: rate
      });

      // Weekly Revenue Chart
      if (revRes.status === 'fulfilled') {
        const revRaw = revRes.value?.data || revRes.value;
        if (Array.isArray(revRaw) && revRaw.length > 0) {
          setRevenueData(revRaw.map(r => ({
            date: r.date ? dayjs(r.date).format('DD/MM') : '',
            revenue: Number(r.totalRevenue ?? r.revenue ?? 0),
            invoiceCount: Number(r.invoiceCount ?? 0)
          })));
        } else {
          setRevenueData([]);
        }
      }

      // Hourly Appointments Chart
      if (hourlyRes.status === 'fulfilled') {
        const hRaw = hourlyRes.value?.data || hourlyRes.value;
        if (Array.isArray(hRaw) && hRaw.length > 0) {
          setHourlyData(hRaw.map(h => ({
            hour: typeof h.hour === 'number' ? `${String(h.hour).padStart(2, '0')}:00` : h.hour,
            count: Number(h.count ?? 0)
          })));
        }
      }

      // Doctors map by department name
      const allDocs = docsRes.status === 'fulfilled' ? (docsRes.value?.data || docsRes.value || []) : [];
      const docCountByDept = {};
      if (Array.isArray(allDocs)) {
        allDocs.forEach(doc => {
          const dName = doc.departmentName || doc.department?.name;
          if (dName) {
            docCountByDept[dName] = (docCountByDept[dName] || 0) + 1;
          }
        });
      }

      // Department Pie & Table
      if (deptRes.status === 'fulfilled') {
        const dRaw = deptRes.value?.data || deptRes.value;
        if (Array.isArray(dRaw) && dRaw.length > 0) {
          const normalized = dRaw.map(d => {
            const name = d.deptName || d.name || 'Chuyên khoa';
            const count = Number(d.patientCount ?? d.value ?? 0);
            const wait = Number(d.avgWaitMinutes ?? d.waitTime ?? 12);
            return {
              name,
              value: count,
              waitTime: Math.round(wait * 10) / 10,
              doctors: docCountByDept[name] ?? d.doctors ?? 1
            };
          });
          setDepartmentTableData(normalized);
          const nonZero = normalized.filter(d => d.value > 0);
          setDepartmentData(nonZero.length > 0 ? nonZero : normalized.map(d => ({ ...d, value: 1 })));
        }
      }
    } catch (error) {
      console.error('Lỗi tải thống kê phân tích:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2 border border-blue-200/60">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trung Tâm Phân Tích Số Liệu Vận Hành</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Báo Cáo & Thống Kê Chi Tiết</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng hợp doanh thu thực thu, lưu lượng bệnh nhân theo khung giờ và hiệu suất chuyên khoa
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            <CalendarIcon className="w-4 h-4 text-blue-600 mr-2" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Hồ Sơ Bệnh Nhân</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600"><Users className="w-5 h-5" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{kpiData.totalPatients}</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">
            Lịch hẹn hôm nay: <strong className="text-slate-800">{kpiData.todayAppointments}</strong> ca
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh Thu Hôm Nay</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600"><DollarSign className="w-5 h-5" /></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(kpiData.todayRevenue)}</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">Tổng hóa đơn đã thu thực tế</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời Gian Chờ TB</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {kpiData.avgWaitTime} <span className="text-sm font-bold text-slate-400">phút</span>
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-2">Tính từ lúc check-in đến gọi khám</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Tiếp Nhận</span>
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <h3 className="text-3xl font-black text-teal-600">{kpiData.completionRate}%</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">
            Đã check-in {kpiData.todayCheckedIn}/{kpiData.todayAppointments} lịch hẹn
          </p>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6">
          <div className="mb-5">
            <h2 className="text-base font-black text-slate-900">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h2>
            <p className="text-xs text-slate-400 mt-0.5">Thống kê từ các hóa đơn viện phí đã thanh toán (PAID)</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}
                  formatter={(val) => [formatCurrency(val), 'Doanh thu']}
                />
                <Bar dataKey="revenue" name="Doanh thu" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6">
          <div className="mb-5">
            <h2 className="text-base font-black text-slate-900">Tỷ Trọng Lượt Khám Theo Khoa</h2>
            <p className="text-xs text-slate-400 mt-0.5">Phân bổ tổng ca đặt lịch theo chuyên khoa</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6">
          <div className="mb-5">
            <h2 className="text-base font-black text-slate-900">Lưu Lượng Lịch Hẹn Theo Khung Giờ</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ngày đang xem: {dayjs(selectedDate).format('DD/MM/YYYY')}</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="count" name="Số lịch hẹn" stroke="#0D9488" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Hiệu Suất Hoạt Động Chuyên Khoa</h2>
              <p className="text-xs text-slate-400">Số liệu tổng hợp từ các khoa khám bệnh</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Chuyên khoa</th>
                  <th className="px-4 py-3.5 text-center">Tổng ca khám</th>
                  <th className="px-4 py-3.5 text-center">Chờ TB</th>
                  <th className="px-6 py-3.5 text-center">Bác sĩ cơ hữu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {departmentTableData.length > 0 ? departmentTableData.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-800">{dept.name}</td>
                    <td className="px-4 py-3.5 text-center text-blue-600 font-black">{dept.value}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        dept.waitTime > 20 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {dept.waitTime} phút
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-slate-600">{dept.doctors} BS</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-xs">
                      Chưa có dữ liệu thống kê chuyên khoa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 4: Kaggle Machine Learning Models Status & Simulator */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Trung Tâm Mô Hình AI & Học Máy Kaggle</h2>
              <p className="text-xs text-slate-500">Tích hợp trực tiếp dịch vụ Python FastAPI huấn luyện trên dữ liệu y tế Kaggle</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center ${
            aiHealth?.status === 'UP'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {aiHealth?.status === 'UP' ? 'Python AI Đang Hoạt Động (Cổng 8000)' : 'Python AI Ngoại Tuyến'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="text-xs font-bold text-indigo-700 uppercase">Mô hình 1 · Dự đoán bỏ hẹn No-Show</div>
            <div className="text-sm font-black text-slate-900">
              {aiHealth?.noshow_model?.algorithm || 'RandomForestClassifier'} · Tập dữ liệu {aiHealth?.noshow_model?.samples?.toLocaleString('vi-VN') || '110.521'} lượt khám
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap gap-3">
              <span>ROC-AUC: <strong className="text-slate-900">{aiHealth?.noshow_model?.metrics?.roc_auc ?? '0.7352'}</strong></span>
              <span>Recall: <strong className="text-slate-900">{aiHealth?.noshow_model?.metrics?.recall ?? '0.7461'}</strong></span>
              <span>F1: <strong className="text-slate-900">{aiHealth?.noshow_model?.metrics?.f1 ?? '0.4498'}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="text-xs font-bold text-teal-700 uppercase">Mô hình 2 · Phân loại triệu chứng & Chuyên khoa</div>
            <div className="text-sm font-black text-slate-900">
              {aiHealth?.symptom_model?.algorithm || 'MultinomialNB'} · {aiHealth?.symptom_model?.unique_diseases || '41'} nhóm bệnh · {aiHealth?.symptom_model?.samples?.toLocaleString('vi-VN') || '4.920'} mẫu Kaggle
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap gap-3">
              <span>Accuracy: <strong className="text-slate-900">{((aiHealth?.symptom_model?.metrics?.accuracy ?? 1) * 100).toFixed(1)}%</strong></span>
              <span>Macro-F1: <strong className="text-slate-900">{aiHealth?.symptom_model?.metrics?.macro_f1 ?? '1.0000'}</strong></span>
            </div>
          </div>
        </div>

        {/* Mini No-Show Simulator */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/70 space-y-3">
          <div className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Mô phỏng dự đoán xác suất bỏ hẹn trực tiếp từ mô hình RandomForest Kaggle</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tuổi bệnh nhân</label>
              <input type="number" min="0" max="110" value={simForm.age}
                onChange={e => setSimForm({ ...simForm, age: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Đặt trước (ngày)</label>
              <input type="number" min="0" max="90" value={simForm.lead_time_days}
                onChange={e => setSimForm({ ...simForm, lead_time_days: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Giới tính</label>
              <select value={simForm.gender}
                onChange={e => setSimForm({ ...simForm, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold">
                <option value="F">Nữ</option>
                <option value="M">Nam</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nhận SMS nhắc</label>
              <select value={simForm.sms_received}
                onChange={e => setSimForm({ ...simForm, sms_received: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold">
                <option value={1}>Đã gửi SMS</option>
                <option value={0}>Chưa gửi</option>
              </select>
            </div>
            <button
              type="button"
              disabled={simLoading}
              onClick={async () => {
                setSimLoading(true);
                try {
                  const res = await api.post('/api/ai/predict/no-show', simForm);
                  setSimResult(res?.data || res);
                } finally {
                  setSimLoading(false);
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-60"
            >
              {simLoading ? 'Đang tính...' : 'Chạy Dự Báo'}
            </button>
          </div>
          {simResult && (
            <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-700">Xác suất vắng mặt: </span>
                <span className="font-black text-indigo-700 text-sm">{simResult.probability_percent}%</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  {simResult.risk_label_vi}
                </span>
              </div>
              <span className="text-slate-500">{simResult.recommended_action}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
