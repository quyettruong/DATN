import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import dayjs from 'dayjs';
import { 
  FileSearch, 
  Activity, 
  Stethoscope, 
  FlaskConical, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Pill, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  FileText, 
  AlertTriangle,
  HeartPulse,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  X
} from 'lucide-react';

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState('EXAMS'); // 'EXAMS' | 'LABS' | 'FOLLOWUPS'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [history, setHistory] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExamId, setExpandedExamId] = useState(null);
  const [previewLab, setPreviewLab] = useState(null);

  useEffect(() => {
    fetchAllRecords();
  }, []);

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const [histRes, labRes, followRes] = await Promise.allSettled([
        api.get('/api/examinations/my-history'),
        api.get('/api/lab-orders/my'),
        api.get('/api/follow-ups/my')
      ]);

      if (histRes.status === 'fulfilled') {
        const raw = histRes.value?.data || histRes.value || [];
        setHistory(Array.isArray(raw) ? raw : []);
      }
      if (labRes.status === 'fulfilled') {
        const raw = labRes.value?.data || labRes.value || [];
        setLabOrders(Array.isArray(raw) ? raw : []);
      }
      if (followRes.status === 'fulfilled') {
        const raw = followRes.value?.data || followRes.value || [];
        setFollowUps(Array.isArray(raw) ? raw : []);
      }
    } catch (error) {
      console.error('Lỗi tải hồ sơ y tế:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgency = (dateStr) => {
    if (!dateStr) return 'normal';
    const followDate = dateStr.split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (followDate < today) return 'overdue';
    const diff = (new Date(followDate) - new Date(today)) / (1000 * 60 * 60 * 24);
    if (diff <= 7) return 'soon';
    return 'normal';
  };

  // Filtered lists
  const filteredHistory = history.filter(item => 
    !searchTerm || 
    item.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLabOrders = labOrders.filter(item => 
    !searchTerm || 
    item.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.testCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowUps = followUps.filter(item => 
    !searchTerm || 
    item.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2 border border-blue-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hồ Sơ Y Tế Điện Tử Cá Nhân (EHR)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lịch Sử Khám Bệnh & Kết Quả Cận Lâm Sàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu kết quả xét nghiệm, lịch sử chẩn đoán, sinh hiệu và các cuộc hẹn tái khám của bạn
          </p>
        </div>

        <button
          onClick={fetchAllRecords}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ── 2. Navigation Tabs & Search Bar ── */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('EXAMS')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 ${
              activeTab === 'EXAMS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Lịch Sử Khám ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LABS')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 ${
              activeTab === 'LABS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Kết Quả Xét Nghiệm ({labOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FOLLOWUPS')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 ${
              activeTab === 'FOLLOWUPS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Lịch Hẹn Tái Khám ({followUps.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo bác sĩ, chẩn đoán, tên XN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* ── 3. Tab Contents ── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Đang đồng bộ hồ sơ y tế từ cơ sở dữ liệu bệnh viện...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: LỊCH SỬ KHÁM BỆNH */}
          {activeTab === 'EXAMS' && (
            <div className="space-y-4">
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((exam) => {
                    const isExpanded = expandedExamId === exam.id;
                    return (
                      <div
                        key={exam.id}
                        className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all overflow-hidden"
                      >
                        {/* Header Bar */}
                        <div
                          onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                          className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-start sm:items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                              <Stethoscope className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-black text-slate-900">
                                  {dayjs(exam.startedAt).format('DD/MM/YYYY')}
                                </span>
                                <span className="text-xs text-slate-400">·</span>
                                <span className="text-xs font-bold text-blue-600">
                                  {exam.doctorName || 'Bác sĩ chuyên khoa'}
                                </span>
                                {exam.patientCode && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                                    #{exam.patientCode}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-black text-slate-800 mt-1">
                                {exam.diagnosis || 'Khám nội trú / tư vấn tổng quát'}
                              </h3>
                              {exam.symptoms && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                  <span className="font-semibold text-slate-700">Triệu chứng:</span> {exam.symptoms}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 self-end sm:self-center">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Đã hoàn tất khám
                            </span>
                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-6">
                            
                            {/* Sinh hiệu */}
                            <div>
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Activity size={15} className="text-rose-500" />
                                <span>Chỉ số sinh tồn (Vitals)</span>
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Huyết áp</p>
                                  <p className="text-sm font-black text-slate-900 mt-0.5">{exam.bloodPressure ? `${exam.bloodPressure} mmHg` : '—'}</p>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nhịp tim</p>
                                  <p className="text-sm font-black text-slate-900 mt-0.5">{exam.heartRate ? `${exam.heartRate} bpm` : '—'}</p>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nhiệt độ</p>
                                  <p className="text-sm font-black text-slate-900 mt-0.5">{exam.temperature ? `${exam.temperature} °C` : '—'}</p>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cân nặng</p>
                                  <p className="text-sm font-black text-slate-900 mt-0.5">{exam.weight ? `${exam.weight} kg` : '—'}</p>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Chiều cao</p>
                                  <p className="text-sm font-black text-slate-900 mt-0.5">{exam.height ? `${exam.height} cm` : '—'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Lâm sàng & Lời dặn */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                                  <FileText size={14} className="text-blue-600" />
                                  <span>Ghi chú chẩn đoán</span>
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                  {exam.notes || 'Bệnh nhân ổn định, tuân thủ phác đồ điều trị được hướng dẫn.'}
                                </p>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                                  <CheckCircle2 size={14} className="text-emerald-600" />
                                  <span>Kết luận & Lời dặn của bác sĩ</span>
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                  {exam.conclusion || 'Uống thuốc đúng giờ, hạn chế đồ cay nóng và dầu mỡ, tái khám đúng hẹn.'}
                                </p>
                              </div>
                            </div>

                            {/* Liên kết tới đơn thuốc */}
                            <div className="flex justify-end pt-2">
                              <Link
                                to="/patient/prescriptions"
                                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl font-bold text-xs transition-colors"
                              >
                                <Pill size={14} />
                                <span>Xem Đơn Thuốc Chi Tiết Của Lần Khám Này</span>
                                <ArrowRight size={13} />
                              </Link>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-black text-slate-800 text-base">Chưa có lịch sử khám bệnh</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Khi bạn hoàn thành các buổi khám trực tiếp hoặc từ xa với bác sĩ, toàn bộ hồ sơ sẽ được lưu trữ tự động tại đây.
                  </p>
                  <Link
                    to="/patient/appointments"
                    className="inline-flex items-center space-x-2 mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    <span>Đặt Lịch Khám Ngay</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KẾT QUẢ CẬN LÂM SÀNG (XÉT NGHIỆM) */}
          {activeTab === 'LABS' && (
            <div className="space-y-4">
              {filteredLabOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLabOrders.map((lab) => {
                    const isCompleted = lab.status === 'COMPLETED';
                    const isInProgress = lab.status === 'IN_PROGRESS';
                    
                    return (
                      <div
                        key={lab.id}
                        className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <FlaskConical className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                                    #{lab.testCode || 'LAB-01'}
                                  </span>
                                  {lab.category && (
                                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                                      {lab.category}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-black text-slate-900 text-sm mt-1">
                                  {lab.testName}
                                </h3>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isInProgress
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isCompleted ? '✓ Đã có kết quả' : isInProgress ? '⏳ Đang phân tích' : 'Chờ lấy mẫu'}
                            </span>
                          </div>

                          {/* Result values display */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                            {isCompleted ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-[11px] text-slate-400 font-bold uppercase">Chỉ số / Kết luận:</p>
                                  {lab.isAbnormal && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                                      ⚠️ Cần lưu ý
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-black text-blue-700">
                                  {lab.result || lab.resultValue || 'Bình thường trong giới hạn tham chiếu'}
                                </p>
                                {lab.normalRange && (
                                  <p className="text-[11px] text-slate-500">
                                    Khoảng tham chiếu: <span className="font-semibold">{lab.normalRange}</span>
                                  </p>
                                )}
                                {/* [Tạm thời comment chức năng xem ảnh / phim chụp X-quang]
                                {lab.attachmentUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewLab(lab)}
                                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold text-xs transition-colors"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>Xem Hình Ảnh Chẩn Đoán / Tệp Đính Kèm</span>
                                  </button>
                                )}
                                */}
                              </div>
                            ) : (
                              <p className="text-slate-500 italic text-[11px]">
                                Phòng Xét nghiệm đang xử lý mẫu thử, kết quả sẽ tự động hiển thị ngay sau khi Kỹ thuật viên ký duyệt.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>BS Chỉ định: <strong className="text-slate-600">{lab.doctorName || 'MediCare'}</strong></span>
                          <span>{lab.orderedAt ? dayjs(lab.orderedAt).format('DD/MM/YYYY HH:mm') : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-black text-slate-800 text-base">Chưa có kết quả cận lâm sàng nào</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Các chỉ định xét nghiệm máu, nước tiểu, chẩn đoán hình ảnh (X-quang, Siêu âm...) của bạn sẽ xuất hiện tại đây ngay khi có kết quả.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LỊCH HẸN TÁI KHÁM */}
          {activeTab === 'FOLLOWUPS' && (
            <div className="space-y-4">
              {filteredFollowUps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFollowUps.map((item) => {
                    const urgency = getUrgency(item.scheduledDate);
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-3xl border-2 p-5 shadow-xs transition-all flex flex-col justify-between ${
                          urgency === 'overdue' 
                            ? 'border-rose-200 bg-rose-50/20' 
                            : urgency === 'soon' 
                            ? 'border-amber-200 bg-amber-50/20' 
                            : 'border-slate-200/80'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                                urgency === 'overdue'
                                  ? 'bg-rose-100 text-rose-600'
                                  : urgency === 'soon'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                <CalendarCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-black text-slate-900 text-base">
                                  {dayjs(item.scheduledDate).format('dddd, DD/MM/YYYY')}
                                </h3>
                                <p className="text-xs text-blue-600 font-bold">
                                  BS. {item.doctorName || 'Bác sĩ điều trị'}
                                </p>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              urgency === 'overdue'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : urgency === 'soon'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {urgency === 'overdue' ? 'Đã quá hạn' : urgency === 'soon' ? 'Sắp đến ngày' : 'Đúng kế hoạch'}
                            </span>
                          </div>

                          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-600">
                            <p className="font-bold text-slate-800 mb-0.5">Lời dặn tái khám:</p>
                            <p className="leading-relaxed">
                              {item.notes || 'Mang theo đơn thuốc cũ và kết quả cận lâm sàng trước đó để bác sĩ đánh giá tiến trình.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Trạng thái: <strong className="text-slate-700">{item.status || 'SCHEDULED'}</strong></span>
                          <Link
                            to="/patient/appointments"
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                          >
                            Đặt Giờ Tái Khám
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-black text-slate-800 text-base">Không có lịch hẹn tái khám nào</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Sau mỗi ca khám hoàn tất, nếu bác sĩ yêu cầu theo dõi định kỳ, lịch tái khám sẽ hiển thị chi tiết tại đây kèm thông báo nhắc hẹn.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* [Tạm thời comment modal xem phim chụp / hình ảnh cận lâm sàng]
      {previewLab && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">{previewLab.testName}</h3>
                <p className="text-xs text-slate-400">{previewLab.result || previewLab.resultValue}</p>
              </div>
              <button onClick={() => setPreviewLab(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center max-h-[75vh] overflow-auto">
              {previewLab.attachmentUrl?.toLowerCase().endsWith('.pdf') ? (
                <a
                  href={previewLab.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2"
                >
                  <FileText size={16} /> Mở tài liệu PDF kết quả trong tab mới <ExternalLink size={14} />
                </a>
              ) : (
                <img
                  src={previewLab.attachmentUrl}
                  alt={previewLab.testName}
                  className="max-h-[65vh] object-contain rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
      */}

    </div>
  );
};

export default HistoryPage;
