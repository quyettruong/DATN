import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Hospital, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  XCircle, 
  QrCode,
  Stethoscope,
  Activity,
  HeartPulse,
  Eye,
  Smile,
  Sparkles,
  Search,
  MapPin,
  ShieldCheck,
  AlertCircle,
  FileText,
  Printer,
  ChevronLeft,
  CalendarCheck,
  Check,
  Flame,
  BadgeAlert
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PrintTicketModal from '../../components/medical/PrintTicketModal';
import VietQRModal from '../../components/payment/VietQRModal';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

// Danh mục icon & màu sắc riêng cho từng chuyên khoa
const DEPARTMENT_METAS = {
  NOI: {
    icon: HeartPulse,
    color: 'from-blue-500 to-indigo-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    symptoms: 'Ho, sốt, đau ngực, khó thở, huyết áp, tiểu đường, tiêu hóa'
  },
  NGOAI: {
    icon: Activity,
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    symptoms: 'Chấn thương, đau khớp, thoát vị, phẫu thuật nội soi, tiểu phẫu'
  },
  TMH: {
    icon: Stethoscope,
    color: 'from-purple-500 to-indigo-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    symptoms: 'Đau rát họng, nghẹt mũi, viêm xoang, ù tai, ho đờm kéo dài'
  },
  RHM: {
    icon: Smile,
    color: 'from-teal-500 to-emerald-600',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    symptoms: 'Đau nhức răng, sâu răng, nhổ răng khôn, niềng răng, viêm nướu'
  },
  MAT: {
    icon: Eye,
    color: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    symptoms: 'Mờ mắt, cộm ngứa mắt, đo thị lực, tật khúc xạ, viêm kết mạc'
  },
  DA: {
    icon: Sparkles,
    color: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    symptoms: 'Mụn, dị ứng, viêm da cơ địa, ngứa, nấm da, chăm sóc da liễu'
  }
};

const COMMON_REASONS = [
  'Khám tổng quát định kỳ',
  'Tái khám theo hẹn bác sĩ',
  'Sốt cao, mệt mỏi toàn thân',
  'Đau đầu, chóng mặt, mất ngủ',
  'Đau bụng, ợ hơi, khó tiêu',
  'Đau nhức khớp, hạn chế vận động'
];

const DEFAULT_MORNING_SLOTS = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
const DEFAULT_AFTERNOON_SLOTS = ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const AppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab chính: 'BOOKING' hoặc 'MY_APPOINTMENTS'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'my' ? 'MY_APPOINTMENTS' : 'BOOKING');
  
  // Wizard steps: 1=Dept, 2=Doctor, 3=DateTime, 4=Confirm
  const [step, setStep] = useState(1);
  const [activeTicket, setActiveTicket] = useState(null);
  
  // Data lists
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // User selections
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [useInsurance, setUseInsurance] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('VIETQR'); // 'VIETQR' | 'LATER'
  const [showVietQrModal, setShowVietQrModal] = useState(false);
  const [pendingPaymentAppt, setPendingPaymentAppt] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Past/My appointments
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);

  useEffect(() => {
    initBookingData();
    fetchMyAppointments();
  }, [searchParams]);

  const initBookingData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/departments');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setDepartments(list);

      const qDeptId = searchParams.get('deptId');
      const qDocId = searchParams.get('doctorId');
      const qKeyword = searchParams.get('q');
      const qDate = searchParams.get('date');

      if (qDate && dayjs(qDate).isValid()) {
        setSelectedDate(dayjs(qDate).format('YYYY-MM-DD'));
      }
      if (qKeyword) {
        setDeptSearch(qKeyword);
        setReason(prev => prev || qKeyword);
      }

      if (qDeptId) {
        const foundDept = list.find(d => String(d.id) === String(qDeptId) || d.code === qDeptId);
        if (foundDept) {
          setSelectedDept(foundDept);
          // Load doctors of this department
          const docRes = await api.get(`/api/doctors?departmentId=${foundDept.id}`);
          const docList = Array.isArray(docRes) ? docRes : (Array.isArray(docRes?.data) ? docRes.data : []);
          setDoctors(docList);

          if (qDocId) {
            const foundDoc = docList.find(d => String(d.id) === String(qDocId));
            if (foundDoc) {
              setSelectedDoctor(foundDoc);
              // Load schedules
              const schedRes = await api.get(`/api/doctors/${foundDoc.id}/schedules?date=${selectedDate}`);
              const schedList = Array.isArray(schedRes) ? schedRes : (Array.isArray(schedRes?.data) ? schedRes.data : []);
              setAvailableSlots(schedList.filter(s => s.availableSlots > 0));
              setStep(3);
              return;
            }
          }
          setStep(2);
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async (deptId) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/doctors?departmentId=${deptId}`);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setDoctors(list);
      setStep(2);
    } catch (error) {
      toast.error('Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/doctors/${doctorId}/schedules?date=${date}`);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const slots = list.filter(schedule => schedule.availableSlots > 0);
      setAvailableSlots(slots);
    } catch (error) {
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      setLoadingMy(true);
      const res = await api.get('/api/appointments/my');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setMyAppointments(list);
    } catch (error) {
      console.error('Lỗi tải lịch hẹn cá nhân:', error);
    } finally {
      setLoadingMy(false);
    }
  };

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    fetchDoctors(dept.id);
  };

  const handleDoctorSelect = (doc) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    setStep(3);
    fetchAvailableSlots(doc.id, selectedDate);
  };

  const handleDateChange = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor.id, dateStr);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleVietQrSuccess = () => {
    setShowVietQrModal(false);
    if (pendingPaymentAppt) {
      setActiveTicket(pendingPaymentAppt);
    }
    // Reset wizard
    setStep(1);
    setSelectedDept(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setReason('');
    
    fetchMyAppointments();
    setActiveTab('MY_APPOINTMENTS');
    toast.success('Thanh toán thành công! Vé khám ưu tiên của bạn đã được kích hoạt.');
  };

  const handleSubmit = async () => {
    if (!selectedDept || !selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Vui lòng chọn đầy đủ thông tin đặt khám');
      return;
    }

    try {
      setSubmitting(true);
      const scheduleId = selectedSlot.id || selectedSlot.scheduleId || availableSlots[0]?.id;
      const startTime = selectedSlot.startTime || selectedSlot.time || '08:00';

      const res = await api.post('/api/appointments', {
        doctorId: selectedDoctor.id,
        scheduleId: scheduleId,
        appointmentDate: selectedDate,
        startTime: startTime,
        reason: reason || 'Khám sức khỏe'
      });
      
      const createdAppt = res?.data || res;

      if (paymentMode === 'VIETQR') {
        // Mở modal thanh toán VietQR động
        setPendingPaymentAppt(createdAppt);
        setShowVietQrModal(true);
      } else {
        toast.success('Đặt lịch khám thành công!');
        if (createdAppt) {
          setActiveTicket(createdAppt);
        }
        // Reset wizard
        setStep(1);
        setSelectedDept(null);
        setSelectedDoctor(null);
        setSelectedSlot(null);
        setReason('');
        
        fetchMyAppointments();
        setActiveTab('MY_APPOINTMENTS');
      }
      
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch khám');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn khám này?')) {
      try {
        await api.post(`/api/appointments/${id}/cancel`);
        toast.success('Đã hủy lịch hẹn thành công');
        fetchMyAppointments();
      } catch (error) {
        toast.error('Không thể hủy lịch hẹn này');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">⏳ Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">✓ Đã xác nhận</span>;
      case 'CHECKED_IN':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🏥 Đã tiếp nhận tại BV</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">✓ Đã khám xong</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">✕ Đã hủy</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Lọc chuyên khoa theo từ khóa tìm kiếm
  const filteredDepartments = departments.filter(d => 
    d.name?.toLowerCase().includes(deptSearch.toLowerCase()) ||
    d.description?.toLowerCase().includes(deptSearch.toLowerCase())
  );

  // Sinh các ngày trong tuần tiếp theo để bệnh nhân bấm chọn nhanh
  const quickDates = Array.from({ length: 6 }).map((_, i) => {
    const d = dayjs().add(i + 1, 'day');
    return {
      dateStr: d.format('YYYY-MM-DD'),
      dayName: i === 0 ? 'Ngày mai' : d.format('dddd'),
      displayDate: d.format('DD/MM')
    };
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Cổng Tiếp Nhận Bệnh Nhân MediCare</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Đặt Lịch Khám & Vé Khám Điện Tử
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Chọn bác sĩ chuyên khoa, đặt giờ khám trực tuyến và nhận vé QR không cần xếp hàng
            </p>
          </div>

          {/* Tab Switcher Pills */}
          <div className="bg-white/10 p-1.5 rounded-2xl flex items-center backdrop-blur-md border border-white/15">
            <button
              onClick={() => setActiveTab('BOOKING')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                activeTab === 'BOOKING'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Đặt Khám Mới</span>
            </button>
            <button
              onClick={() => setActiveTab('MY_APPOINTMENTS')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                activeTab === 'MY_APPOINTMENTS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Vé Khám Của Tôi</span>
              {myAppointments.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-black">
                  {myAppointments.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BOOKING WIZARD 2 CỘT CHUẨN DOCTOLIB / MEDPRO                       */}
      {/* ========================================================================= */}
      {activeTab === 'BOOKING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI (8 Cols): CÁC BƯỚC ĐẶT LỊCH (WIZARD) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stepper Progress Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, title: 'Chuyên khoa', desc: 'Chọn khoa khám' },
                  { num: 2, title: 'Bác sĩ', desc: 'Chọn chuyên gia' },
                  { num: 3, title: 'Thời gian', desc: 'Ngày & khung giờ' },
                  { num: 4, title: 'Xác nhận', desc: 'Thông tin phiếu' }
                ].map((s, idx) => {
                  const isActive = step === s.num;
                  const isDone = step > s.num;
                  return (
                    <React.Fragment key={s.num}>
                      <button
                        onClick={() => { if (step > s.num) setStep(s.num); }}
                        disabled={step < s.num}
                        className={`flex items-center space-x-3 text-left transition-all ${
                          isActive ? 'scale-105' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                          isDone 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : isActive 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-blue-50' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isDone ? <Check className="w-5 h-5" /> : s.num}
                        </div>
                        <div className="hidden sm:block">
                          <p className={`text-xs font-bold ${isActive ? 'text-blue-600' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                            {s.title}
                          </p>
                          <p className="text-[10px] text-slate-400">{s.desc}</p>
                        </div>
                      </button>
                      {idx < 3 && (
                        <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                          step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-100'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 1: CHỌN CHUYÊN KHOA */}
            {step === 1 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Bước 1: Chọn Chuyên Khoa Khám Bệnh</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Lựa chọn chuyên khoa phù hợp với triệu chứng sức khỏe của bạn</p>
                  </div>
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Tìm tên khoa, triệu chứng..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    Đang tải danh mục chuyên khoa...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredDepartments.map((dept) => {
                      const meta = DEPARTMENT_METAS[dept.code] || {
                        icon: Hospital,
                        color: 'from-blue-500 to-indigo-600',
                        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
                        symptoms: dept.description || 'Khám và tư vấn chuyên khoa'
                      };
                      const IconComponent = meta.icon;
                      const isSelected = selectedDept?.id === dept.id;

                      return (
                        <div
                          key={dept.id}
                          onClick={() => handleDeptSelect(dept)}
                          className={`p-5 rounded-3xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md group relative overflow-hidden ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                              : 'border-slate-200/80 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                {dept.name}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {dept.description || meta.symptoms}
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                  <span>Chọn khoa này</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Mã: {dept.code}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* BƯỚC 2: CHỌN BÁC SĨ CHUYÊN KHOA */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Chọn lại chuyên khoa</span>
                  </button>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Khoa: {selectedDept?.name}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Bước 2: Chọn Bác Sĩ Trực Khám</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Danh sách các chuyên gia & bác sĩ đang có lịch nhận khám</p>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    Đang tìm bác sĩ phụ trách khoa...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">Khoa này hiện chưa có lịch bác sĩ trực</p>
                    <button
                      onClick={() => setStep(1)}
                      className="mt-3 text-xs font-bold text-blue-600 underline"
                    >
                      Chọn chuyên khoa khác
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctors.map((doc) => {
                      const isSelected = selectedDoctor?.id === doc.id;
                      const initial = (doc.fullName || doc.user?.fullName || 'BS').charAt(0);
                      const docName = doc.fullName || doc.user?.fullName || `BS. ${doc.licenseNo}`;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleDoctorSelect(doc)}
                          className={`p-5 rounded-3xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md relative ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                              : 'border-slate-200/80 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-md">
                              {initial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold mb-0.5">
                                <span>⭐ 4.9</span>
                                <span className="text-slate-400 font-normal">(120+ lượt khám)</span>
                              </div>
                              <h3 className="font-black text-slate-900 text-base">{docName}</h3>
                              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                                {doc.specialization || selectedDept?.name || 'Bác sĩ chuyên khoa'}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Số chứng chỉ: <span className="font-mono">{doc.licenseNo || 'LIC-000'}</span>
                              </p>
                              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                  Có lịch khám
                                </span>
                                <span className="text-xs font-bold text-blue-600">Chọn bác sĩ &rarr;</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* BƯỚC 3: CHỌN NGÀY & KHUNG GIỜ KHÁM (TIME SLOT MATRIX) */}
            {step === 3 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Chọn lại bác sĩ</span>
                  </button>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {selectedDoctor?.fullName || selectedDoctor?.user?.fullName}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Bước 3: Chọn Ngày & Giờ Khám Bệnh</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Hệ thống phân bổ theo khung giờ để tránh chờ đợi tại phòng khám</p>
                </div>

                {/* Chọn ngày nhanh dạng Pill */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    1. Chọn ngày khám bệnh
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {quickDates.map((qd) => {
                      const isSelDate = selectedDate === qd.dateStr;
                      return (
                        <button
                          key={qd.dateStr}
                          type="button"
                          onClick={() => handleDateChange(qd.dateStr)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isSelDate
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30 font-bold scale-[1.02]'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:border-blue-300'
                          }`}
                        >
                          <p className={`text-[11px] ${isSelDate ? 'text-blue-100' : 'text-slate-400'}`}>{qd.dayName}</p>
                          <p className="text-base font-black mt-0.5">{qd.displayDate}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Hoặc chọn ngày tùy ý:</span>
                    <input
                      type="date"
                      min={dayjs().format('YYYY-MM-DD')}
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Khung giờ khám (Sáng / Chiều) */}
                <div className="space-y-4 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    2. Chọn khung giờ khám (Ca sáng & Ca chiều)
                  </label>

                  {/* Ca Sáng */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-3">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Ca Sáng (07:30 - 11:30)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
                      {DEFAULT_MORNING_SLOTS.map((slotTime) => {
                        // Tìm xem có schedule tương ứng không
                        const matchedSchedule = availableSlots.find(s => s.startTime === slotTime || s.time === slotTime);
                        const isChosen = selectedSlot?.startTime === slotTime || selectedSlot?.time === slotTime;
                        
                        return (
                          <button
                            key={slotTime}
                            type="button"
                            onClick={() => handleSlotSelect(matchedSchedule || { id: availableSlots[0]?.id || 1, startTime: slotTime })}
                            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all ${
                              isChosen
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20'
                                : 'bg-white border border-slate-200/90 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                            }`}
                          >
                            {slotTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ca Chiều */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-3">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Ca Chiều (13:30 - 16:30)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {DEFAULT_AFTERNOON_SLOTS.map((slotTime) => {
                        const matchedSchedule = availableSlots.find(s => s.startTime === slotTime || s.time === slotTime);
                        const isChosen = selectedSlot?.startTime === slotTime || selectedSlot?.time === slotTime;

                        return (
                          <button
                            key={slotTime}
                            type="button"
                            onClick={() => handleSlotSelect(matchedSchedule || { id: availableSlots[0]?.id || 1, startTime: slotTime })}
                            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all ${
                              isChosen
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20'
                                : 'bg-white border border-slate-200/90 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                            }`}
                          >
                            {slotTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 4: XÁC NHẬN & MÔ TẢ TRIỆU CHỨNG */}
            {step === 4 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Chọn lại thời gian</span>
                  </button>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Đã chọn: {selectedSlot?.startTime || '08:00'} · {dayjs(selectedDate).format('DD/MM/YYYY')}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Bước 4: Nhập Triệu Chứng & Lý Do Khám</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Bác sĩ sẽ dựa vào triệu chứng để chuẩn bị hồ sơ thăm khám chu đáo nhất</p>
                </div>

                {/* Gợi ý lý do khám nhanh */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Chọn nhanh lý do thường gặp
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          reason === r
                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        + {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input lý do chi tiết */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                    Mô tả triệu chứng cụ thể
                  </label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="VD: Sốt 38.5 độ từ chiều qua, ho khan, đau rát họng, mệt mỏi..."
                    className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Tùy chọn BHYT */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="insurance"
                    checked={useInsurance}
                    onChange={(e) => setUseInsurance(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="insurance" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                    <strong className="text-slate-900 block font-bold">Tôi có sử dụng thẻ Bảo Hiểm Y Tế (BHYT)</strong>
                    Xuất trình thẻ BHYT hoặc VssID tại quầy tiếp nhận để được hưởng quyền lợi khám chữa bệnh theo quy định Bộ Y Tế.
                  </label>
                </div>

                {/* Phương thức thanh toán viện phí */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Hình thức thanh toán phí khám
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* VietQR */}
                    <div 
                      onClick={() => setPaymentMode('VIETQR')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMode === 'VIETQR'
                          ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>Chuyển Khoản VietQR</span>
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          Khuyên Dùng
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Thanh toán tạm ứng <strong>150.000 đ</strong> bằng App Ngân hàng bất kỳ. Được cấp mã ưu tiên vào thẳng phòng khám.
                      </p>
                    </div>

                    {/* Thanh toán sau */}
                    <div 
                      onClick={() => setPaymentMode('LATER')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMode === 'LATER'
                          ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <Hospital className="w-4 h-4 text-slate-500" />
                          <span>Thanh Toán Sau Tại Quầy</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Đặt chỗ trước, đến bệnh viện sẽ xếp hàng lấy số thứ tự và thanh toán viện phí tại quầy thu ngân.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* CỘT PHẢI (4 Cols): STICKY BOOKING SUMMARY PASS (TỔNG KẾT PHIẾU KHÁM) */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            
            {/* Thẻ Vé Khám Trực Tiếp (Boarding Pass Style) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
              
              {/* Header phiếu */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center relative">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                  <Hospital className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-lg tracking-tight">Phiếu Khám Bệnh Dự Kiến</h3>
                <p className="text-blue-100 text-xs mt-0.5">Bệnh Viện Đa Khoa MediCare</p>
              </div>

              {/* Chi tiết phiếu */}
              <div className="p-6 space-y-4 text-xs">
                
                {/* Khoa & Bác sĩ */}
                <div className="pb-3 border-b border-dashed border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400">Chuyên khoa:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {selectedDept?.name || 'Chưa chọn chuyên khoa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400">Bác sĩ:</span>
                    <span className="font-bold text-blue-600 text-right">
                      {selectedDoctor?.fullName || selectedDoctor?.user?.fullName || 'Chưa chọn bác sĩ'}
                    </span>
                  </div>
                </div>

                {/* Thời gian */}
                <div className="pb-3 border-b border-dashed border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ngày khám:</span>
                    <span className="font-bold text-slate-800">
                      {dayjs(selectedDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Khung giờ:</span>
                    <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {selectedSlot?.startTime || 'Chưa chọn giờ'}
                    </span>
                  </div>
                </div>

                {/* Tiền khám */}
                <div className="pb-3 border-b border-dashed border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Giá khám ban đầu:</span>
                    <span className="font-black text-slate-900 text-sm">150.000 đ</span>
                  </div>
                  {useInsurance && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>Bảo hiểm hỗ trợ:</span>
                      <span>Đúng tuyến 80% - 100%</span>
                    </div>
                  )}
                </div>

                {/* Quyền lợi đặt online */}
                <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 text-[11px] text-blue-900 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Quyền Lợi Đặt Hẹn Trước:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    • Nhận mã QR vé khám điện tử ngay sau khi đặt.<br />
                    • Quét mã tại quầy tiếp nhận để lấy STT ưu tiên, không chờ xếp hàng.
                  </p>
                </div>

                {/* Nút bấm xác nhận đặt khám */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedDept || !selectedDoctor || !selectedSlot}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : paymentMode === 'VIETQR' ? (
                    <QrCode className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span>
                    {submitting 
                      ? 'Đang xử lý...' 
                      : paymentMode === 'VIETQR' 
                        ? 'Xác Nhận & Quét Mã VietQR (150.000 đ)' 
                        : 'Xác Nhận & Đặt Lịch Khám'}
                  </span>
                </button>

              </div>
            </div>

            {/* Hỗ trợ & hotline */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4 text-center text-xs text-slate-500">
              <p>Cần hỗ trợ đặt khám gấp? Gọi tổng đài:</p>
              <p className="font-black text-blue-600 text-sm mt-0.5">📞 1900 1234 (24/7)</p>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DANH SÁCH VÉ KHÁM ĐIỆN TỬ CỦA TÔI (MY APPOINTMENTS AS PASS CARDS)  */}
      {/* ========================================================================= */}
      {activeTab === 'MY_APPOINTMENTS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Vé Khám & Lịch Sử Đặt Khám Của Bạn</h2>
              <p className="text-xs text-slate-500 mt-0.5">Xuất trình mã QR từ vé khám này tại quầy tiếp nhận bệnh viện</p>
            </div>
            <button
              onClick={() => setActiveTab('BOOKING')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>+ Đặt Lịch Khám Mới</span>
            </button>
          </div>

          {loadingMy ? (
            <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              Đang tải danh sách vé khám điện tử...
            </div>
          ) : myAppointments.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Bạn chưa có lịch hẹn khám nào</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
                Hãy đặt lịch khám trực tuyến để được xếp số ưu tiên và gặp bác sĩ đúng giờ hẹn.
              </p>
              <button
                onClick={() => setActiveTab('BOOKING')}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/20"
              >
                Đặt Khám Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAppointments.map((appt) => {
                const qrTicketData = JSON.stringify({
                  appointmentId: appt.id,
                  patientName: appt.patientName,
                  date: appt.appointmentDate,
                  time: appt.startTime || appt.timeSlot,
                  doctor: appt.doctorName,
                  dept: appt.departmentName
                });

                const isCancelable = appt.status === 'PENDING' || appt.status === 'CONFIRMED';

                return (
                  <div
                    key={appt.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Header vé */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mã Vé Khám</span>
                        <span className="font-mono font-black text-blue-600 text-base">
                          #APPT-{String(appt.id).padStart(5, '0')}
                        </span>
                      </div>
                      <div>
                        {getStatusBadge(appt.status)}
                      </div>
                    </div>

                    {/* Nội dung vé */}
                    <div className="p-5 space-y-4">
                      
                      {/* Bác sĩ & Khoa */}
                      <div>
                        <p className="text-xs text-slate-400 font-semibold">Chuyên khoa & Bác sĩ</p>
                        <h4 className="font-black text-slate-900 text-base mt-0.5">
                          {appt.departmentName || 'Khoa Nội Tổng Quát'}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                          <span>{appt.doctorName}</span>
                        </p>
                      </div>

                      {/* Ngày & Giờ */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-slate-700">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-bold">{dayjs(appt.appointmentDate).format('DD/MM/YYYY')}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-indigo-700 font-black bg-indigo-50 px-2.5 py-1 rounded-xl">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{appt.startTime || appt.timeSlot || '08:00'}</span>
                        </div>
                      </div>

                      {/* Mã QR Thu Nhỏ để Quét Nhanh */}
                      <div className="flex items-center space-x-4 p-3 bg-blue-50/40 rounded-2xl border border-blue-100">
                        <div className="p-1.5 bg-white rounded-xl shadow-xs border border-blue-200">
                          <QRCodeSVG value={qrTicketData} size={54} />
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <p className="font-bold text-slate-900">Mã QR Tiếp Nhận</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Đưa mã này cho quầy tiếp nhận để lấy STT tự động</p>
                        </div>
                      </div>

                    </div>

                    {/* Footer hành động */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                      <button
                        onClick={() => setActiveTicket(appt)}
                        className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Xem Vé & In QR</span>
                      </button>
                      
                      {isCancelable && (
                        <button
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="py-2.5 px-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all"
                          title="Hủy lịch hẹn"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Modal In Vé Khám Điện Tử có QR code */}
      {activeTicket && (
        <PrintTicketModal
          appointment={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}

      {/* Modal Thanh Toán VietQR Động NAPAS 247 */}
      {showVietQrModal && pendingPaymentAppt && (
        <VietQRModal
          isOpen={showVietQrModal}
          onClose={() => {
            setShowVietQrModal(false);
            if (pendingPaymentAppt) setActiveTicket(pendingPaymentAppt);
            fetchMyAppointments();
            setActiveTab('MY_APPOINTMENTS');
          }}
          onSuccess={handleVietQrSuccess}
          amount={150000}
          memo={`MEDICARE APPT ${pendingPaymentAppt.id}`}
          title="Thanh Toán Tạm Ứng Khám Bệnh"
          subTitle={`Lịch khám: ${pendingPaymentAppt.departmentName || 'Khoa khám'} - ${pendingPaymentAppt.doctorName || 'Bác sĩ'}`}
        />
      )}

    </div>
  );
};

export default AppointmentPage;
