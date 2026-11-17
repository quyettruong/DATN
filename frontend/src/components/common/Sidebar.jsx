import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard, Calendar, Users, ClipboardList, Activity, FileText, Settings, X, Hospital,
  Stethoscope, Microscope, ListOrdered, Pill, FlaskConical, Clock, HeartPulse, CheckCircle,
  DollarSign, PieChart, Package
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuthStore();

  const getNavItems = () => {
    const role = user?.role;
    
    const commonItems = [
      { path: '/profile', name: 'Hồ sơ cá nhân', icon: <Users size={20} /> }
    ];

    switch (role) {
      case 'ADMIN':
        return [
          { path: '/admin', name: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
          { path: '/admin/analytics', name: 'Thống kê chi tiết', icon: <PieChart size={20} /> },
          { path: '/admin/users', name: 'Quản lý người dùng', icon: <Users size={20} /> },
          { path: '/admin/departments', name: 'Quản lý phòng ban', icon: <Hospital size={20} /> },
          { path: '/admin/inventory', name: 'Quản lý kho thuốc', icon: <Package size={20} /> },
          { path: '/admin/medications', name: 'Danh mục thuốc', icon: <Pill size={20} /> },
          { path: '/admin/lab-tests', name: 'Danh mục XN', icon: <FlaskConical size={20} /> },
          { path: '/admin/settings', name: 'Cài đặt hệ thống', icon: <Settings size={20} /> },
          ...commonItems
        ];
      case 'DOCTOR':
        return [
          { path: '/doctor', name: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
          { path: '/doctor/queue', name: 'Hàng đợi phòng', icon: <ListOrdered size={20} /> },
          { path: '/doctor/examination', name: 'Khám bệnh', icon: <Stethoscope size={20} /> },
          { path: '/doctor/prescriptions', name: 'Đơn thuốc', icon: <Pill size={20} /> },
          { path: '/doctor/schedule', name: 'Lịch làm việc', icon: <Calendar size={20} /> },
          ...commonItems
        ];
      case 'STAFF':
        return [
          { path: '/staff', name: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
          { path: '/staff/check-in', name: 'Tiếp nhận bệnh nhân', icon: <ClipboardList size={20} /> },
          { path: '/staff/triage', name: 'Phân loại BN', icon: <HeartPulse size={20} /> },
          { path: '/staff/billing', name: 'Thu ngân', icon: <DollarSign size={20} /> },
          { path: '/staff/pharmacy', name: 'Quầy phát thuốc', icon: <Pill size={20} /> },
          { path: '/staff/queue-board', name: 'Bảng hàng đợi', icon: <Activity size={20} /> },
          { path: '/staff/appointments', name: 'Quản lý lịch hẹn', icon: <Calendar size={20} /> },
          ...commonItems
        ];
      case 'LAB_TECHNICIAN':
        return [
          { path: '/lab', name: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
          { path: '/lab/orders', name: 'Quản lý xét nghiệm', icon: <FlaskConical size={20} /> },
          ...commonItems
        ];
      case 'PATIENT':
      default:
        return [
          { path: '/patient', name: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
          { path: '/patient/appointments/new', name: 'Đặt lịch khám', icon: <Calendar size={20} /> },
          { path: '/patient/appointments', name: 'Lịch hẹn của tôi', icon: <Clock size={20} /> },
          { path: '/patient/queue', name: 'Hàng đợi', icon: <ListOrdered size={20} /> },
          { path: '/patient/history', name: 'Lịch sử khám', icon: <FileText size={20} /> },
          { path: '/patient/prescriptions', name: 'Đơn thuốc', icon: <Pill size={20} /> },
          { path: '/patient/invoices', name: 'Hóa đơn của tôi', icon: <DollarSign size={20} /> },
          { path: '/patient/follow-ups', name: 'Lịch tái khám', icon: <HeartPulse size={20} /> },
          ...commonItems
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'ADMIN': return { label: 'Quản trị viên', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'DOCTOR': return { label: 'Bác sĩ chuyên khoa', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
      case 'STAFF': return { label: 'Nhân viên tiếp nhận', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'LAB_TECHNICIAN': return { label: 'Kỹ thuật viên XN', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'PATIENT':
      default: return { label: 'Bệnh nhân', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`print:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-800/80 bg-slate-950/40">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-white font-extrabold text-xl tracking-tight">MediCare</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Hệ thống Y tế Số</p>
            </div>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-5 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Chức năng chính
              </p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.badge}`}>
                {user?.role}
              </span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  end={item.path === '/patient' || item.path === '/admin' || item.path === '/doctor' || item.path === '/staff' || item.path === '/lab'}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <span className="mr-3 transition-transform group-hover:scale-110">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        
        {/* User Card Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
          <Link to="/profile" className="flex items-center p-2 rounded-xl hover:bg-slate-800/70 transition-colors group">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center font-bold text-white shadow-sm">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {roleInfo.label}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
