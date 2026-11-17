import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  LogOut,
  User,
  Bell,
  Menu,
  Clock,
  ChevronDown,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  DollarSign,
  Pill,
  FlaskConical,
  HeartPulse
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadRoleAlerts = async () => {
      if (!user?.role) return;
      const items = [];
      try {
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          const [dashRes, rxRes, triageRes] = await Promise.allSettled([
            api.get('/api/stats/dashboard'),
            api.get('/api/pharmacy/prescriptions?status=PRESCRIBED'),
            api.get('/api/triage/pending')
          ]);
          const dash = dashRes.status === 'fulfilled' ? (dashRes.value?.data || dashRes.value) : null;
          const rxList = rxRes.status === 'fulfilled' ? (rxRes.value?.data || rxRes.value || []) : [];
          const triageList = triageRes.status === 'fulfilled' ? (triageRes.value?.data || triageRes.value || []) : [];

          if (dash?.pendingInvoices > 0) {
            items.push({
              id: 'inv',
              title: `${dash.pendingInvoices} hóa đơn chờ thu ngân`,
              desc: 'Cần xác nhận thanh toán tiền mặt hoặc VietQR',
              to: '/staff/billing',
              tone: 'amber',
              icon: DollarSign
            });
          }
          if (Array.isArray(rxList) && rxList.length > 0) {
            items.push({
              id: 'rx',
              title: `${rxList.length} đơn thuốc chờ cấp phát`,
              desc: 'Xuất kho tự động theo chuẩn FEFO tại Nhà thuốc',
              to: '/staff/pharmacy',
              tone: 'teal',
              icon: Pill
            });
          }
          if (Array.isArray(triageList) && triageList.length > 0) {
            items.push({
              id: 'triage',
              title: `${triageList.length} bệnh nhân chờ đo sinh hiệu`,
              desc: 'Cần phân loại mức độ ưu tiên lâm sàng',
              to: '/staff/triage',
              tone: 'rose',
              icon: HeartPulse
            });
          }
        } else if (user.role === 'DOCTOR') {
          const [qRes, labRes] = await Promise.allSettled([
            api.get('/api/queues/my-queue'),
            api.get('/api/lab-orders/doctor/completed')
          ]);
          const qList = qRes.status === 'fulfilled' ? (qRes.value?.data || qRes.value || []) : [];
          const labList = labRes.status === 'fulfilled' ? (labRes.value?.data || labRes.value || []) : [];
          if (Array.isArray(qList) && qList.length > 0) {
            items.push({
              id: 'doc-q',
              title: `${qList.length} bệnh nhân trong hàng đợi phòng`,
              desc: 'Bấm để mở màn hình điều phối và gọi khám',
              to: '/doctor/queue',
              tone: 'blue',
              icon: Stethoscope
            });
          }
          if (Array.isArray(labList) && labList.length > 0) {
            items.push({
              id: 'doc-lab',
              title: `${labList.length} kết quả CLS đã hoàn tất`,
              desc: 'Phòng xét nghiệm đã trả kết quả cho bệnh nhân của bạn',
              to: '/doctor/examination',
              tone: 'teal',
              icon: FlaskConical
            });
          }
        } else if (user.role === 'LAB_TECHNICIAN') {
          const ordRes = await api.get('/api/lab-orders?status=ORDERED').catch(() => null);
          const ordList = ordRes?.data || ordRes || [];
          if (Array.isArray(ordList) && ordList.length > 0) {
            items.push({
              id: 'lab-ord',
              title: `${ordList.length} phiếu xét nghiệm mới chờ lấy mẫu`,
              desc: 'Cần tiếp nhận mẫu bệnh phẩm và xử lý kết quả',
              to: '/lab/orders',
              tone: 'blue',
              icon: FlaskConical
            });
          }
        }
      } catch (err) {
        // Ignore background polling errors
      }
      if (mounted) {
        setAlerts(items);
      }
    };

    loadRoleAlerts();
    return () => { mounted = false; };
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">Quản trị viên</span>;
      case 'DOCTOR':
        return <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">Bác sĩ</span>;
      case 'STAFF':
        return <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">Nhân viên y tế</span>;
      case 'LAB_TECHNICIAN':
        return <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">KTV Xét nghiệm</span>;
      case 'PATIENT':
      default:
        return <span className="bg-teal-50 text-teal-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">Bệnh nhân</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <nav className="print:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none lg:hidden transition-colors"
              aria-label="Mở thanh điều hướng"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-semibold capitalize">
              <Clock className="w-3.5 h-3.5 mr-2 text-blue-600" />
              <span>{currentTime.format('dddd, DD/MM/YYYY · HH:mm:ss')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick link to Public Portal */}
            <Link
              to="/queue-display"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 border border-slate-200/80 transition-colors"
              title="Mở màn hình gọi số TV công khai"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Bảng Gọi Số TV</span>
            </Link>

            {/* Live Shift Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                }}
                className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors relative"
                title="Thông báo tác vụ ca trực"
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white">
                    {alerts.length}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifMenu(false)} />
                  <div className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-xl bg-white ring-1 ring-slate-900/5 z-20 overflow-hidden border border-slate-200/80">
                    <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black tracking-wide">Tác Vụ Ca Trực Hiện Tại</p>
                        <p className="text-[11px] text-slate-400">Cập nhật trực tiếp từ hệ thống lâm sàng</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-cyan-300">
                        {alerts.length} mục
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {alerts.length > 0 ? (
                        alerts.map((item) => {
                          const IconComp = item.icon || AlertTriangle;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setShowNotifMenu(false);
                                navigate(item.to);
                              }}
                              className="w-full p-3.5 hover:bg-slate-50 flex items-start gap-3 text-left transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.desc}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 mt-1 flex-shrink-0" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-800">Không có tác vụ tồn đọng</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Mọi hàng đợi và hồ sơ trong ca trực đều đã được xử lý.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-none"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-slate-800">{user?.fullName || user?.username || 'Người dùng'}</span>
                  {getRoleBadge(user?.role)}
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/20 text-xs">
                  {getInitials(user?.fullName || user?.username)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white ring-1 ring-slate-900/5 z-20 overflow-hidden border border-slate-100">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tài khoản đăng nhập</p>
                      <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || `#${user?.username || ''}`}</p>
                    </div>
                    <div className="p-1.5 flex flex-col space-y-0.5" role="menu">
                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                        className="flex items-center w-full px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors text-left"
                      >
                        <User className="w-4 h-4 mr-2.5 text-slate-400" /> Hồ sơ cá nhân
                      </button>
                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/'); }}
                        className="flex items-center w-full px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors text-left"
                      >
                        <Globe className="w-4 h-4 mr-2.5 text-slate-400" /> Cổng thông tin bệnh viện
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors text-left"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
