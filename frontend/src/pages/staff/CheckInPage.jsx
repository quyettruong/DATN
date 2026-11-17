import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Printer,
  QrCode,
  Stethoscope,
  Phone,
  RefreshCw,
  Building2,
  Sparkles,
  UserPlus,
  Activity,
  HeartPulse,
  MapPin
} from 'lucide-react';
import dayjs from 'dayjs';
import PrintQueueSlipModal from '../../components/medical/PrintQueueSlipModal';

const DEFAULT_ROOMS = [
  { id: 1, name: 'Phòng 101 - Khám Nội Tổng Quát', deptName: 'Khoa Nội' },
  { id: 2, name: 'Phòng 102 - Khám Tim Mạch & Huyết Áp', deptName: 'Khoa Nội' },
  { id: 3, name: 'Phòng 201 - Khám Ngoại Tổng Quát', deptName: 'Khoa Ngoại' },
  { id: 4, name: 'Phòng 202 - Tiểu Phẫu & Bó Bột', deptName: 'Khoa Ngoại' },
  { id: 5, name: 'Phòng 301 - Khám Tai Mũi Họng', deptName: 'Khoa Tai Mũi Họng' },
  { id: 7, name: 'Phòng 401 - Khám Răng Hàm Mặt', deptName: 'Khoa Răng Hàm Mặt' },
  { id: 9, name: 'Phòng 501 - Khám Mắt & Đo Thị Lực', deptName: 'Khoa Mắt' },
  { id: 11, name: 'Phòng 601 - Khám Da Liễu', deptName: 'Khoa Da Liễu' }
];

const CheckInPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('APPOINTMENT'); // 'APPOINTMENT' | 'WALK_IN'
  
  // Appointment check-in states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Walk-in check-in states
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [doctors, setDoctors] = useState([]);
  const [walkInForm, setWalkInForm] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: 'MALE',
    address: '',
    roomId: '1',
    doctorId: '',
    reason: 'Khám bệnh thông thường',
    urgencyLevel: 0
  });
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);

  useEffect(() => {
    fetchAuxData();
    if (searchQuery) {
      handleSearch();
    }
  }, []);

  const fetchAuxData = async () => {
    try {
      const [docRes, deptRes] = await Promise.allSettled([
        api.get('/api/doctors'),
        api.get('/api/departments')
      ]);
      if (docRes.status === 'fulfilled') {
        const list = Array.isArray(docRes.value) ? docRes.value : (docRes.value?.data || []);
        setDoctors(list);
      }
      if (deptRes.status === 'fulfilled') {
        const depts = Array.isArray(deptRes.value) ? deptRes.value : (deptRes.value?.data || []);
        const roomLists = await Promise.all(
          depts.map(d =>
            api.get(`/api/departments/${d.id}/rooms`)
              .then(rRes => {
                const rArr = Array.isArray(rRes) ? rRes : (rRes?.data || []);
                return rArr.map(r => ({
                  id: r.id,
                  name: `${r.name || r.roomName || `Phòng ${r.id}`} - ${d.name}`,
                  deptName: d.name
                }));
              })
              .catch(() => [])
          )
        );
        const flatRooms = roomLists.flat();
        if (flatRooms.length > 0) {
          setRooms(flatRooms);
          setWalkInForm(prev => ({ ...prev, roomId: String(flatRooms[0].id) }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const parseSearchInput = (query) => {
    const raw = query.trim();
    if (!raw) return null;

    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.appointmentId) return { type: 'id', id: parsed.appointmentId };
        if (parsed.id) return { type: 'id', id: parsed.id };
      } catch (e) {}
    }

    const matchCode = raw.match(/APPT-?0*(\d+)/i);
    if (matchCode) {
      return { type: 'id', id: parseInt(matchCode[1], 10) };
    }

    if (/^\d+$/.test(raw)) {
      return { type: 'id_or_phone', value: raw };
    }

    return { type: 'text', value: raw };
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError('');
      setAppointment(null);
      setTicket(null);
      
      const parsed = parseSearchInput(searchQuery);
      if (!parsed) return;

      let found = null;

      if (parsed.type === 'id') {
        try {
          const res = await api.get(`/api/appointments/${parsed.id}`);
          found = res?.data || res;
        } catch (err) {}
      } else if (parsed.type === 'id_or_phone') {
        try {
          const res = await api.get(`/api/appointments/${parsed.value}`);
          if (res?.id || res?.data?.id) {
            found = res?.data || res;
          }
        } catch (err) {}

        if (!found) {
          const today = dayjs().format('YYYY-MM-DD');
          const res = await api.get(`/api/appointments?date=${today}`);
          const list = Array.isArray(res) ? res : (res?.data || []);
          found = list.find(a => 
            a.patientPhone?.includes(parsed.value) || 
            String(a.id) === parsed.value
          );
        }
      } else {
        const today = dayjs().format('YYYY-MM-DD');
        const res = await api.get(`/api/appointments?date=${today}`);
        const list = Array.isArray(res) ? res : (res?.data || []);
        found = list.find(a => 
          a.patientName?.toLowerCase().includes(parsed.value.toLowerCase())
        );
      }
      
      if (found && found.id) {
        setAppointment(found);
      } else {
        setError('Không tìm thấy lịch hẹn phù hợp. Vui lòng kiểm tra lại mã hoặc số điện thoại.');
      }
    } catch (err) {
      setError('Lỗi khi tra cứu dữ liệu lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!appointment) return;
    
    try {
      setCheckingIn(true);
      const res = await api.post(`/api/queues/check-in/${appointment.id}`);
      const ticketData = res?.data || res;
      setTicket(ticketData);
      setShowSlipModal(true);
      toast.success('Tiếp nhận thành công! Đã cấp số thứ tự.');
      setAppointment(prev => ({...prev, status: 'CHECKED_IN'}));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tiếp nhận bệnh nhân');
    } finally {
      setCheckingIn(false);
    }
  };

  // Walk-in check-in submission
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInForm.fullName.trim()) {
      return toast.error('Vui lòng nhập họ và tên bệnh nhân');
    }
    if (!walkInForm.phone.trim()) {
      return toast.error('Vui lòng nhập số điện thoại');
    }
    if (!walkInForm.roomId) {
      return toast.error('Vui lòng chọn phòng khám');
    }

    try {
      setSubmittingWalkIn(true);
      const payload = {
        roomId: Number(walkInForm.roomId),
        doctorId: walkInForm.doctorId ? Number(walkInForm.doctorId) : null,
        fullName: walkInForm.fullName.trim(),
        phone: walkInForm.phone.trim(),
        dob: walkInForm.dob || null,
        gender: walkInForm.gender,
        address: walkInForm.address.trim(),
        reason: walkInForm.reason.trim(),
        urgencyLevel: Number(walkInForm.urgencyLevel)
      };

      const res = await api.post('/api/queues/walk-in', payload);
      const ticketData = res?.data || res;
      setTicket(ticketData);
      setAppointment({
        patientName: walkInForm.fullName.trim(),
        patientPhone: walkInForm.phone.trim(),
        departmentName: rooms.find(r => r.id === Number(walkInForm.roomId))?.deptName || 'Khám Vãng Lai',
        doctorName: doctors.find(d => d.id === Number(walkInForm.doctorId))?.fullName || 'Bác sĩ trực phòng',
        appointmentDate: new Date(),
        timeSlot: dayjs().format('HH:mm')
      });
      setShowSlipModal(true);
      toast.success('Đã tiếp nhận bệnh nhân vãng lai & cấp số thứ tự!');

      // Reset walk-in form
      setWalkInForm({
        fullName: '',
        phone: '',
        dob: '',
        gender: 'MALE',
        address: '',
        roomId: '1',
        doctorId: '',
        reason: 'Khám bệnh thông thường',
        urgencyLevel: 0
      });

    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tiếp nhận bệnh nhân vãng lai');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setAppointment(null);
    setTicket(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-300 text-xs font-semibold mb-3 border border-white/10">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Quầy Tiếp Nhận & Điều Phối Bệnh Viện</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Tiếp Nhận & Cấp Số Thứ Tự</h1>
            <p className="text-slate-300 text-sm mt-1">Hỗ trợ tiếp nhận bệnh nhân có lịch hẹn trực tuyến và bệnh nhân vãng lai</p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200">Hôm nay: <strong className="text-white">{dayjs().format('DD/MM/YYYY')}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs Chuyển đổi: Lịch Hẹn / Vãng Lai */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => { setActiveTab('APPOINTMENT'); resetForm(); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'APPOINTMENT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Tiếp Nhận Lịch Hẹn / Quét QR (Đã Đặt Online)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('WALK_IN'); resetForm(); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'WALK_IN'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Tiếp Nhận Bệnh Nhân Vãng Lai (Chưa Có Lịch Hẹn)</span>
        </button>
      </div>

      {/* ── TAB 1: TIẾP NHẬN THEO LỊCH HẸN / QR SCAN ── */}
      {activeTab === 'APPOINTMENT' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-10 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base placeholder-slate-400 transition-all font-medium"
                  placeholder="Nhập mã lịch hẹn (#APPT-0001), quét QR hoặc SĐT..."
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span>Tìm Kiếm</span>
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-2.5 flex items-center gap-1.5 pl-1">
              <QrCode className="w-3.5 h-3.5 text-blue-500" />
              Hỗ trợ máy quét mã vạch/QR cắm ngoài (tự động nhận diện chuỗi QR vé khám điện tử).
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Chi tiết lịch hẹn tìm thấy */}
          {appointment && !ticket && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <h2 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Hồ sơ lịch hẹn: <strong className="text-blue-600 font-mono">#APPT-{String(appointment.id).padStart(5, '0')}</strong></span>
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' :
                  appointment.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {appointment.status === 'CONFIRMED' ? '✓ Đã xác nhận' :
                   appointment.status === 'CHECKED_IN' ? '✓ Đã tiếp nhận' :
                   appointment.status === 'PENDING' ? '⏳ Chờ duyệt' : appointment.status}
                </span>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Họ và tên bệnh nhân</label>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{appointment.patientName}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">{appointment.patientPhone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                </div>
                
                <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuyên khoa & Bác sĩ</label>
                    <p className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      {appointment.departmentName || 'Đa Khoa'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      Bác sĩ: <strong className="text-slate-700">{appointment.doctorName}</strong>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Khung giờ hẹn</label>
                    <p className="text-slate-800 font-semibold text-sm flex items-center mt-0.5">
                      <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                      {dayjs(appointment.appointmentDate).format('DD/MM/YYYY')}
                      <Clock className="w-4 h-4 ml-4 mr-1.5 text-indigo-600" />
                      {appointment.timeSlot || dayjs(appointment.appointmentDate).format('HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button 
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-white transition-colors text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn || appointment.status === 'CHECKED_IN'}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2 text-sm"
                >
                  {checkingIn ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{appointment.status === 'CHECKED_IN' ? 'Đã được cấp số trước đó' : 'Xác Nhận & Cấp Số Thứ Tự'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: TIẾP NHẬN BỆNH NHÂN VÃNG LAI ── */}
      {activeTab === 'WALK_IN' && !ticket && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Phiếu Tiếp Nhận Bệnh Nhân Vãng Lai</h2>
              <p className="text-xs text-slate-500 mt-0.5">Nhập thông tin bệnh nhân đến trực tiếp để đăng ký khám và cấp số ngay lập tức</p>
            </div>
          </div>

          <form onSubmit={handleWalkInSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Họ và Tên Bệnh Nhân <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: NGUYỄN VĂN AN"
                  value={walkInForm.fullName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Số Điện Thoại Liên Hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0912345678"
                  value={walkInForm.phone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Ngày Sinh (hoặc Năm Sinh)
                </label>
                <input
                  type="date"
                  value={walkInForm.dob}
                  onChange={(e) => setWalkInForm({ ...walkInForm, dob: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Giới Tính
                </label>
                <select
                  value={walkInForm.gender}
                  onChange={(e) => setWalkInForm({ ...walkInForm, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Địa Chỉ Cư Trú
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  value={walkInForm.address}
                  onChange={(e) => setWalkInForm({ ...walkInForm, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Chỉ Định Phòng Khám & Bác Sĩ Tiếp Nhận</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Phòng Khám Tiếp Nhận <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={walkInForm.roomId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, roomId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-blue-900 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.deptName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Bác Sĩ Khám (Tùy Chọn)
                  </label>
                  <select
                    value={walkInForm.doctorId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, doctorId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Bác sĩ trực phòng tự động --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.fullName || d.user?.fullName} ({d.specialization || 'Bác sĩ'})</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Lý Do Khám / Triệu Chứng Ban Đầu
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Sốt cao, đau họng, tức ngực hoặc khám tổng quát..."
                    value={walkInForm.reason}
                    onChange={(e) => setWalkInForm({ ...walkInForm, reason: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Mức Độ Khẩn Cấp Ban Đầu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setWalkInForm({ ...walkInForm, urgencyLevel: 0 })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        walkInForm.urgencyLevel === 0
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Bình Thường (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalkInForm({ ...walkInForm, urgencyLevel: 1 })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        walkInForm.urgencyLevel === 1
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Ưu Tiên (1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalkInForm({ ...walkInForm, urgencyLevel: 2 })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        walkInForm.urgencyLevel === 2
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Cấp Cứu Nặng (2)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submittingWalkIn}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {submittingWalkIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Tiếp Nhận...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác Nhận & Cấp Số Thứ Tự Vãng Lai</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thẻ Kết Quả Sau Khi Tiếp Nhận (Cả Appointment & Walk-in) */}
      {ticket && (
        <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-500 overflow-hidden text-center p-8 max-w-lg mx-auto relative animate-in zoom-in-95 duration-200">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-1.5 rounded-bl-2xl text-xs font-black tracking-wider uppercase">
            ✓ Đã Tiếp Nhận
          </div>
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cấp Số Thứ Tự Thành Công</h2>
          <p className="text-slate-500 text-sm mt-1">{appointment?.patientName}</p>
          
          <div className="border-t border-b border-dashed border-slate-200 py-6 my-6 bg-slate-50/60 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số Thứ Tự Khám</p>
            <p className="text-6xl font-black text-blue-600 tracking-tight">{ticket.queueNumber}</p>
            <p className="text-base font-bold text-slate-800 mt-2">{ticket.roomName || 'Phòng Khám Chỉ Định'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Người chờ phía trước</p>
              <p className="font-extrabold text-xl text-slate-800 mt-0.5">{ticket.position || 0} người</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">TG dự kiến gọi</p>
              <p className="font-extrabold text-xl text-blue-600 mt-0.5">~{ticket.estimatedWaitMinutes || ticket.estimatedWaitTime || 15} phút</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowSlipModal(true)}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex justify-center items-center space-x-2 text-sm transition-all"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>In Phiếu Khám</span>
            </button>
            <button 
              onClick={resetForm}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm flex justify-center items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tiếp Bệnh Nhân Khác</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal In Phiếu Số Thứ Tự */}
      {showSlipModal && (
        <PrintQueueSlipModal
          ticket={ticket}
          appointment={appointment}
          onClose={() => setShowSlipModal(false)}
        />
      )}
    </div>
  );
};

export default CheckInPage;
