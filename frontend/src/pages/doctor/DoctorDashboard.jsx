import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Stethoscope, 
  Pill, 
  Play, 
  AlertCircle, 
  Calendar, 
  PhoneCall, 
  ChevronRight, 
  Activity, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import dayjs from 'dayjs';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);
  const [queueList, setQueueList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    waiting: 0,
    inExam: 0
  });

  const [hourlyDistribution, setHourlyDistribution] = useState([
    { hour: '07:30', count: 0 },
    { hour: '08:30', count: 0 },
    { hour: '09:30', count: 0 },
    { hour: '10:30', count: 0 },
    { hour: '11:30', count: 0 },
    { hour: '13:30', count: 0 },
    { hour: '14:30', count: 0 },
    { hour: '15:30', count: 0 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/queues/my-queue');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setQueueList(list);

      const total = list.length;
      const completed = list.filter(q => q.status === 'COMPLETED').length;
      const waiting = list.filter(q => q.status === 'WAITING' || q.status === 'CALLED').length;
      const inExam = list.filter(q => q.status === 'IN_EXAM').length;

      setStats({
        total,
        completed,
        waiting,
        inExam
      });

      // Tạo phân bổ giờ khám nếu có dữ liệu
      if (list.length > 0) {
        const hourMap = {};
        list.forEach(item => {
          const time = item.createdAt ? dayjs(item.createdAt).format('HH:00') : '08:00';
          hourMap[time] = (hourMap[time] || 0) + 1;
        });
        const dist = Object.keys(hourMap).sort().map(h => ({ hour: h, count: hourMap[h] }));
        if (dist.length > 0) setHourlyDistribution(dist);
      }

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard bác sĩ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    try {
      setCallingNext(true);
      const res = await api.post('/api/queues/call-next');
      const ticket = res?.data || res;
      if (ticket && ticket.id) {
        toast.success(`Đã gọi bệnh nhân: ${ticket.patientName} (STT: ${ticket.queueNumber})`);
        navigate(`/doctor/examination/${ticket.id}`);
      } else {
        toast.error('Không còn bệnh nhân nào đang chờ!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hàng đợi hiện không có bệnh nhân chờ');
    } finally {
      setCallingNext(false);
    }
  };

  // Xác định bệnh nhân hiện tại hoặc kế tiếp
  const activeTicket = queueList.find(q => q.status === 'IN_EXAM') || 
                       queueList.find(q => q.status === 'CALLED') ||
                       queueList.find(q => q.status === 'WAITING');

  const waitingTickets = queueList.filter(q => q.status === 'WAITING' || q.status === 'CALLED');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Phòng Khám Điều Trị Ngoại Trú (OPD)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              BS. {user?.fullName || 'Bác sĩ trực'}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Hôm nay là {dayjs().format('dddd, DD/MM/YYYY')} · Phòng khám đang hoạt động trực tuyến
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCallNext}
              disabled={callingNext || stats.waiting === 0}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{callingNext ? 'Đang gọi số...' : 'Gọi Bệnh Nhân Kế Tiếp'}</span>
            </button>
            <Link
              to="/doctor/examination"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-2xl font-semibold text-sm transition-all flex items-center space-x-2 backdrop-blur-md"
            >
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Vào Bàn Khám</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards / Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs animate-pulse h-32">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
              <div className="h-8 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Tổng lượt */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Tiếp Nhận</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</h3>
              <span className="text-xs text-slate-400 font-medium">bệnh nhân</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-blue-600 font-bold">100%</span> lịch khám trong ca
            </p>
          </div>

          {/* Card 2: Đã hoàn thành */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã Khám Xong</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{stats.completed}</h3>
              <span className="text-xs text-slate-400 font-medium">ca</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              Tỷ lệ hoàn thành:{' '}
              <strong className="text-emerald-600 font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </strong>
            </p>
          </div>

          {/* Card 3: Đang chờ ngoài phòng */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang Chờ Khám</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-amber-600 tracking-tight">{stats.waiting}</h3>
              <span className="text-xs text-slate-400 font-medium">người</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              {stats.waiting > 5 ? (
                <span className="text-rose-500 font-bold">Hàng đợi khá đông</span>
              ) : (
                <span className="text-slate-400">Thời gian chờ ổn định</span>
              )}
            </p>
          </div>

          {/* Card 4: Đang khám */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang Trong Phòng</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-indigo-600 tracking-tight">{stats.inExam}</h3>
              <span className="text-xs text-slate-400 font-medium">bệnh nhân</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block mr-1" />
              Trạng thái phòng khám trực tiếp
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Hàng đợi thực tế & Biểu đồ / Thẻ bệnh nhân */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Bảng Hàng Đợi Live Queue & Biểu đồ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Queue Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Hàng Đợi Trực Tiếp Cửa Phòng Khám</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {waitingTickets.length} đang chờ
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Đang đồng bộ hàng đợi...</div>
            ) : waitingTickets.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Hiện không có bệnh nhân chờ</h4>
                <p className="text-slate-400 text-xs mt-1">Khi quầy tiếp nhận cấp số mới, danh sách sẽ hiển thị tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[11px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">STT</th>
                      <th className="py-3.5 px-4">Bệnh nhân</th>
                      <th className="py-3.5 px-4">Giờ nhận</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {waitingTickets.slice(0, 6).map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-sm border border-blue-100">
                            {ticket.queueNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {ticket.patientName}
                          {ticket.priorityScore > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black rounded-md">
                              Ưu tiên
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-xs">
                          {ticket.createdAt ? dayjs(ticket.createdAt).format('HH:mm') : '--:--'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            ticket.status === 'CALLED' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            ticket.status === 'IN_EXAM' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.status === 'CALLED' ? 'Đã gọi số' :
                             ticket.status === 'IN_EXAM' ? 'Đang khám' : 'Đang chờ'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => navigate(`/doctor/examination/${ticket.id}`)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                          >
                            <span>Khám</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hourly Patient Distribution Chart */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-black text-slate-900">Phân Bổ Lượng Bệnh Nhân Theo Giờ</h3>
                <p className="text-xs text-slate-400 mt-0.5">Mật độ bệnh nhân đến khám trong ca trực</p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>Số ca tiếp nhận</span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="count" name="Số ca" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Bệnh nhân hiện tại & Truy cập nhanh */}
        <div className="space-y-6">
          
          {/* Card Bệnh nhân đang khám hoặc kế tiếp */}
          {activeTicket ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
                <Stethoscope size={100} />
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md inline-block mb-3">
                {activeTicket.status === 'IN_EXAM' ? 'Đang Khám Tại Phòng' : 'Bệnh Nhân Tiếp Theo'}
              </span>
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-3xl font-black text-amber-300">#{activeTicket.queueNumber}</span>
                <h3 className="text-xl font-bold tracking-tight">{activeTicket.patientName}</h3>
              </div>
              <p className="text-blue-100 text-xs mb-5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Tiếp nhận lúc: {activeTicket.createdAt ? dayjs(activeTicket.createdAt).format('HH:mm') : '--:--'}
              </p>
              
              <button
                onClick={() => navigate(`/doctor/examination/${activeTicket.id}`)}
                className="w-full py-3.5 bg-white text-blue-700 font-black rounded-2xl shadow-md hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <span>Mở Bệnh Án & Khám Ngay</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-3">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Chưa có ca khám trực tiếp</h3>
              <p className="text-slate-400 text-xs mt-1 mb-4 leading-relaxed">
                Nhấn &quot;Gọi Bệnh Nhân Kế Tiếp&quot; hoặc chọn số từ hàng đợi để tiến hành khám.
              </p>
              <button
                onClick={handleCallNext}
                disabled={stats.waiting === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Gọi Bệnh Nhân
              </button>
            </div>
          )}

          {/* Quick Access Menu */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-2">
            <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider text-[11px] text-slate-400">
              Công Cụ Khám Chữa Bệnh
            </h3>
            
            <Link
              to="/doctor/examination"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Bàn Khám Bệnh Ngoại Trú</h4>
                  <p className="text-xs text-slate-400">Kê đơn, chẩn đoán, chỉ định CLS</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link
              to="/doctor/prescriptions"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Quản Lý Đơn Thuốc</h4>
                  <p className="text-xs text-slate-400">Lịch sử kê đơn, in toa thuốc</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </Link>

            <Link
              to="/doctor/schedule"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Lịch Trực Tuần Này</h4>
                  <p className="text-xs text-slate-400">Theo dõi ca trực & số slot</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 text-xs text-slate-600 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Quy Chuẩn Chuyên Môn 2026</span>
            </div>
            <p className="leading-relaxed text-slate-500">
              Vui lòng hoàn thiện hồ sơ bệnh án và in toa thuốc ký điện tử ngay sau khi kết thúc ca khám để đồng bộ sang quầy Dược & Thu ngân.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
