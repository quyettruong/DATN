import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Users, 
  Hospital, 
  Calendar, 
  Server, 
  TrendingUp, 
  Pill, 
  FlaskConical, 
  AlertTriangle, 
  FileText,
  DollarSign,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Settings,
  ChevronRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    departments: 0,
    appointmentsToday: 0,
    dailyRevenue: 0,
    totalPatients: 0
  });
  
  const [revenueData, setRevenueData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: 0, unpaidInvoices: 0 });

  const COLORS = ['#2563EB', '#0D9488', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes, dashRes, revRes, pieRes, invRes, billRes] = await Promise.allSettled([
        api.get('/api/users'),
        api.get('/api/departments'),
        api.get('/api/stats/dashboard'),
        api.get('/api/stats/revenue/weekly'),
        api.get('/api/stats/departments/stats'),
        api.get('/api/pharmacy/inventory/low-stock'),
        api.get('/api/billing/invoices/unpaid')
      ]);
      
      const allUsers = usersRes.status === 'fulfilled' ? (usersRes.value?.data || usersRes.value || []) : [];
      const doctors = Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'DOCTOR').length : 0;
      
      const dashData = dashRes.status === 'fulfilled' ? (dashRes.value?.data || dashRes.value) : null;
      const deptsData = deptsRes.status === 'fulfilled' ? (deptsRes.value?.data || deptsRes.value || []) : [];
      
      setStats({
        users: Array.isArray(allUsers) ? allUsers.length : 0,
        doctors: dashData?.totalDoctors ?? doctors,
        departments: dashData?.totalDepts ?? (Array.isArray(deptsData) ? deptsData.length : 0),
        appointmentsToday: dashData?.todayAppointments ?? dashData?.appointmentsToday ?? 0,
        todayCheckedIn: dashData?.todayCheckedIn ?? 0,
        dailyRevenue: dashData?.todayRevenue ?? dashData?.dailyRevenue ?? 0,
        totalPatients: dashData?.totalPatients ?? 0,
        avgWaitTime: dashData?.avgWaitTime ?? 12.5
      });
      
      // Revenue data (map backend { date, totalRevenue } -> { date: 'DD/MM', revenue })
      if (revRes.status === 'fulfilled') {
        const revData = revRes.value?.data || revRes.value;
        if (Array.isArray(revData) && revData.length > 0) {
          setRevenueData(revData.map(item => ({
            date: item.date ? dayjs(item.date).format('DD/MM') : '',
            revenue: Number(item.totalRevenue ?? item.revenue ?? 0),
            invoiceCount: Number(item.invoiceCount ?? 0)
          })));
        } else {
          setRevenueData(Array.from({ length: 7 }).map((_, i) => ({
            date: dayjs().subtract(6 - i, 'day').format('DD/MM'),
            revenue: 0
          })));
        }
      } else {
        setRevenueData(Array.from({ length: 7 }).map((_, i) => ({
          date: dayjs().subtract(6 - i, 'day').format('DD/MM'),
          revenue: 0
        })));
      }

      // Department distribution data (map backend { deptName, patientCount } -> { name, value })
      if (pieRes.status === 'fulfilled') {
        const pieData = pieRes.value?.data || pieRes.value;
        if (Array.isArray(pieData) && pieData.length > 0) {
          const mapped = pieData
            .map(d => ({
              name: d.deptName || d.name || 'Chuyên khoa',
              value: Number(d.patientCount ?? d.value ?? 0)
            }))
            .filter(d => d.value > 0);
          setDepartmentData(mapped.length > 0 ? mapped : pieData.map(d => ({
            name: d.deptName || d.name || 'Chuyên khoa',
            value: 1
          })));
        } else {
          setDepartmentData([]);
        }
      } else {
        setDepartmentData([]);
      }

      // Alerts
      const invData = invRes.status === 'fulfilled' ? (invRes.value?.data || invRes.value || []) : [];
      const billData = billRes.status === 'fulfilled' ? (billRes.value?.data || billRes.value || []) : [];
      setAlerts({
        lowStock: Array.isArray(invData) ? invData.length : 0,
        unpaidInvoices: Array.isArray(billData) ? billData.length : 0
      });

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => (amount || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Trung Tâm Chỉ Huy Y Tế Số (HIS Command Center)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Bảng Điều Khiển Quản Trị
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Hôm nay là {dayjs().format('dddd, DD/MM/YYYY')} · Bệnh viện hoạt động theo quy chuẩn Bộ Y Tế
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/analytics"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Báo Cáo Phân Tích</span>
            </Link>
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 text-xs font-bold backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Hệ thống trực tuyến 99.98%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs animate-pulse h-36">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
              <div className="h-8 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Tổng hồ sơ bệnh nhân */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Hồ Sơ Bệnh Nhân</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalPatients}</h3>
              <span className="text-xs text-slate-400 font-medium">hồ sơ EHR</span>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Đã tiếp nhận hôm nay: {stats.todayCheckedIn || 0} ca</span>
            </div>
          </div>

          {/* Card 2: Doanh thu hôm nay */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh Thu Hôm Nay</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
                {formatCurrency(stats.dailyRevenue)}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Bao gồm dịch vụ khám & nhà thuốc
            </p>
          </div>

          {/* Card 3: Phòng ban & Chuyên khoa */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chuyên Khoa / Bác Sĩ</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Hospital className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.departments}</h3>
              <span className="text-xs text-slate-400 font-medium">khoa ({stats.doctors} bác sĩ)</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Đầy đủ nhân sự phụ trách ca trực
            </p>
          </div>

          {/* Card 4: Lịch hẹn trong ngày */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lịch Hẹn Khám</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-amber-600 tracking-tight">{stats.appointmentsToday}</h3>
              <span className="text-xs text-slate-400 font-medium">lịch đặt</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Tiếp nhận & check-in qua QR Code
            </p>
          </div>
        </div>
      )}

      {/* Operational Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link 
          to="/admin/inventory" 
          className="bg-rose-50/60 border border-rose-200 rounded-3xl p-5 flex items-center justify-between hover:bg-rose-50 transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-rose-100 text-rose-600 rounded-2xl group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-rose-900 text-sm">Cảnh Báo Dự Trữ Kho Dược</h4>
              <p className="text-xs text-rose-600 mt-0.5">
                Có <strong className="font-black">{alerts.lowStock}</strong> mặt hàng thuốc chạm ngưỡng tối thiểu
              </p>
            </div>
          </div>
          <div className="text-rose-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Kiểm kho</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
        
        <Link 
          to="/staff/billing" 
          className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 flex items-center justify-between hover:bg-amber-50 transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-amber-900 text-sm">Hóa Đơn Chờ Thu Ngân</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Có <strong className="font-black">{alerts.unpaidInvoices}</strong> hóa đơn chưa thanh toán viện phí
              </p>
            </div>
          </div>
          <div className="text-amber-700 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Thu ngân</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Main Charts: Revenue 7 days & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Doanh thu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Doanh Thu 7 Ngày Gần Nhất</h3>
              <p className="text-xs text-slate-400 mt-0.5">Biểu đồ tổng doanh số dịch vụ & dược phẩm</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>VNĐ</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(val) => formatCurrency(val)} 
                />
                <Bar dataKey="revenue" name="Doanh thu" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tỷ trọng khám theo khoa */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Phân Bổ Bệnh Nhân Theo Chuyên Khoa</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cơ cấu tỷ lệ khám các phòng ban</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quick Navigation Hub */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Danh Mục Quản Trị Hệ Thống</h3>
            <p className="text-xs text-slate-400 mt-0.5">Truy cập nhanh các phân hệ chuyên môn y tế</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/admin/users" 
            className="flex items-start p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/40 transition-all group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Quản Trị Tài Khoản</h4>
              <p className="text-xs text-slate-400 mt-0.5">Bác sĩ, Điều dưỡng, Bệnh nhân</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/departments" 
            className="flex items-start p-4 border border-slate-100 rounded-2xl hover:border-purple-200 hover:bg-purple-50/40 transition-all group"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mr-3 group-hover:scale-105 transition-transform">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Khoa & Phòng Khám</h4>
              <p className="text-xs text-slate-400 mt-0.5">Cơ cấu tổ chức & phòng trực</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/inventory" 
            className="flex items-start p-4 border border-slate-100 rounded-2xl hover:border-teal-200 hover:bg-teal-50/40 transition-all group"
          >
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl mr-3 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Kho Thuốc & Dược Phẩm</h4>
              <p className="text-xs text-slate-400 mt-0.5">Nhập xuất tồn, lô thuốc, HSD</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/lab-tests" 
            className="flex items-start p-4 border border-slate-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/40 transition-all group"
          >
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl mr-3 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Danh Mục Cận Lâm Sàng</h4>
              <p className="text-xs text-slate-400 mt-0.5">Xét nghiệm, CĐHA, đơn giá viện phí</p>
            </div>
          </Link>

          <Link 
            to="/admin/medications" 
            className="flex items-start p-4 border border-slate-100 rounded-2xl hover:border-cyan-200 hover:bg-cyan-50/40 transition-all group"
          >
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl mr-3 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Danh Mục Dược Phẩm</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hoạt chất, hàm lượng, nhà sản xuất</p>
            </div>
          </Link>

          <Link 
            to="/admin/settings" 
            className="flex items-start p-4 border border-slate-100 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all group"
          >
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl mr-3 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Cấu Hình Hệ Thống</h4>
              <p className="text-xs text-slate-400 mt-0.5">Thuật toán hàng đợi & giờ làm việc</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
