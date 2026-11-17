import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  User, Activity, Stethoscope, FileText, Pill, Calendar as CalendarIcon, 
  CheckCircle, ChevronDown, ChevronRight, Plus, Printer, FileSearch, Trash2, AlertTriangle, Sparkles,
  ShieldAlert, AlertOctagon, Heart, Image as ImageIcon, ExternalLink, X
} from 'lucide-react';
import PrintPrescriptionModal from '../../components/medical/PrintPrescriptionModal';
import dayjs from 'dayjs';

const COMMON_SYMPTOMS = ['Sốt cao', 'Ho có đờm', 'Đau rát họng', 'Đau đầu', 'Chóng mặt', 'Tức ngực', 'Khó thở', 'Đau dạ dày'];
const COMMON_ICD = [
  'Viêm họng cấp (J02)',
  'Cảm cúm thông thường (J00)',
  'Viêm phế quản cấp (J20)',
  'Tăng huyết áp vô căn (I10)',
  'Viêm dạ dày tá tràng (K29)',
  'Rối loạn tiền đình (H81)'
];

const ExaminationPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [history, setHistory] = useState([]);
  const [queue, setQueue] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPrescModal, setShowPrescModal] = useState(false);
  const [previewLabOrder, setPreviewLabOrder] = useState(null);
  
  // Catalogs
  const [labTests, setLabTests] = useState([]);
  const [medications, setMedications] = useState([]);
  
  // Data lists
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  
  // Forms
  const [examForm, setExamForm] = useState({
    symptoms: '', diagnosis: '', notes: '', conclusion: '',
    bloodPressure: '', heartRate: '', temperature: '', weight: '', height: ''
  });
  const [labForm, setLabForm] = useState({ labTestId: '', notes: '' });
  const [prescForm, setPrescForm] = useState({ 
    medicationId: '', dosage: '', frequency: '', duration: '', quantity: '', instruction: '' 
  });
  const [followUpForm, setFollowUpForm] = useState({ scheduledDate: '', notes: '' });

  // Clinical Drug Safety & Allergy Alert State
  const [drugAlerts, setDrugAlerts] = useState({
    hasCriticalAlert: false,
    hasWarningAlert: false,
    totalAlerts: 0,
    alerts: []
  });
  const [checkingInteractions, setCheckingInteractions] = useState(false);

  // Init fetch
  useEffect(() => {
    fetchCatalogs();
    fetchQueue();
    if (ticketId) {
      fetchExamDetails(ticketId);
    }
  }, [ticketId]);

  const fetchCatalogs = async () => {
    try {
      const [labsRes, medsRes] = await Promise.all([
        api.get('/api/catalog/lab-tests'),
        api.get('/api/catalog/medications')
      ]);
      setLabTests(labsRes.data || []);
      setMedications(medsRes.data || []);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await api.get(`/api/queues/my-queue?date=${dayjs().format('YYYY-MM-DD')}`);
      setQueue(res.data || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchExamDetails = async (paramId) => {
    setLoading(true);
    try {
      let data = null;

      // 1. Thử lấy ca khám theo ticketId trước (khi điều hướng từ hàng đợi)
      try {
        const ticketRes = await api.get(`/api/examinations/ticket/${paramId}`);
        data = ticketRes?.data || ticketRes;
      } catch (e) {
        // Tiếp tục kiểm tra cách khác
      }

      // 2. Thử lấy theo id ca khám (examinationId)
      if (!data || !data.id) {
        try {
          const examRes = await api.get(`/api/examinations/${paramId}`);
          data = examRes?.data || examRes;
        } catch (e) {
          // Tiếp tục
        }
      }

      // 3. Nếu chưa có bệnh án cho ticketId này, tự động bắt đầu ca khám (startExamination)
      if (!data || !data.id) {
        try {
          const startRes = await api.post(`/api/examinations/${paramId}/start`);
          data = startRes?.data || startRes;
        } catch (e) {
          console.error('Không thể tự khởi tạo ca khám:', e);
        }
      }

      if (data && data.id) {
        setExam(data);
        setExamForm({
          symptoms: data.symptoms || '',
          diagnosis: data.diagnosis || '',
          notes: data.notes || location.state?.quickNote || '',
          conclusion: data.conclusion || '',
          bloodPressure: data.bloodPressure || '',
          heartRate: data.heartRate || '',
          temperature: data.temperature || '',
          weight: data.weight || '',
          height: data.height || ''
        });
        
        // Fetch patient history
        if (data.patientId) {
          const histRes = await api.get(`/api/examinations/patient/${data.patientId}/history`);
          setHistory(histRes?.data || histRes || []);
        }
        
        // Fetch orders and prescs
        fetchOrders(data.id);
        fetchPrescriptions(data.id);
      } else {
        toast.error('Không tìm thấy thông tin bệnh án');
      }
    } catch (error) {
      toast.error('Lỗi khi tải thông tin bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (examId) => {
    try {
      const res = await api.get(`/api/lab-orders/examination/${examId}`);
      setOrders(res.data || []);
    } catch (e) {}
  };

  const fetchPrescriptions = async (examId) => {
    try {
      const res = await api.get(`/api/prescriptions/examination/${examId}`);
      setPrescriptions(res.data?.[0]?.items || []);
    } catch (e) {}
  };

  const handleUpdateExam = async () => {
    try {
      await api.put(`/api/examinations/${exam.id}`, examForm);
      toast.success('Đã lưu thông tin khám');
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin');
    }
  };

  const handleCompleteExam = async () => {
    if (!window.confirm('Xác nhận hoàn thành ca khám và chuyển hóa đơn sang Quầy thu ngân?')) return;
    try {
      await handleUpdateExam(); // save clinical info first
      if (prescriptions.length > 0) {
        const normalizedItems = prescriptions
          .map(p => {
            const medId = p.medicationId || medications.find(m => m.name === p.medicationName)?.id;
            return medId ? {
              medicationId: Number(medId),
              dosage: p.dosage,
              frequency: p.frequency,
              duration: p.duration,
              quantity: Math.max(1, parseInt(p.quantity, 10) || 1),
              instruction: p.instruction
            } : null;
          })
          .filter(Boolean);
        if (normalizedItems.length > 0) {
          await api.post(`/api/prescriptions?examId=${exam.id}`, {
            diagnosis: examForm.diagnosis,
            notes: examForm.conclusion || examForm.notes,
            items: normalizedItems
          });
        }
      }
      await api.post(`/api/examinations/${exam.id}/complete`);

      toast.success('Hoàn tất ca khám! Đã tổng hợp tự động viện phí sang Quầy thu ngân.');
      navigate('/doctor');
    } catch (error) {
      toast.error('Lỗi khi hoàn thành khám: ' + (error?.message || 'Vui lòng thử lại'));
    }
  };

  const callNext = async () => {
    try {
      const called = await api.post('/api/queues/call-next');
      const calledTicket = called?.data || called;
      if (!calledTicket?.id) {
        toast.error('Không có bệnh nhân chờ trong hàng đợi');
        return;
      }
      await api.post(`/api/queues/${calledTicket.id}/start-exam`);
      const examRes = await api.get(`/api/examinations/ticket/${calledTicket.id}`);
      const examData = examRes?.data || examRes;
      toast.success(`Đang gọi số ${calledTicket.queueNumber} - ${calledTicket.patientName || ''}`);
      if (examData?.id) {
        navigate(`/doctor/examination/${examData.id}`);
      } else {
        navigate(`/doctor/examination/${calledTicket.id}`);
      }
    } catch (error) {
      toast.error(error?.message || 'Lỗi gọi bệnh nhân');
    }
  };

  const handleAddLabOrder = async (e) => {
    e.preventDefault();
    if (!labForm.labTestId) return toast.error('Vui lòng chọn xét nghiệm');
    try {
      await api.post(`/api/lab-orders?examId=${exam.id}`, labForm);
      toast.success('Đã thêm chỉ định');
      await fetchOrders(exam.id);
      setLabForm({ labTestId: '', notes: '' });
    } catch (e) { toast.error('Lỗi thêm chỉ định'); }
  };

  const checkDrugSafety = async (currentItems, candidateMedId = null) => {
    if (!exam?.id && !exam?.patientId) return;

    const medIds = (currentItems || [])
      .map(p => Number(p.medicationId))
      .filter(Boolean);

    if (candidateMedId) {
      const cId = Number(candidateMedId);
      if (cId && !medIds.includes(cId)) {
        medIds.push(cId);
      }
    }

    if (medIds.length === 0) {
      setDrugAlerts({ hasCriticalAlert: false, hasWarningAlert: false, totalAlerts: 0, alerts: [] });
      return;
    }

    try {
      setCheckingInteractions(true);
      const res = await api.post('/api/prescriptions/check-interactions', {
        patientId: exam?.patientId,
        examinationId: exam?.id,
        medicationIds: medIds
      });
      const data = res?.data || res;
      setDrugAlerts(data || { hasCriticalAlert: false, hasWarningAlert: false, totalAlerts: 0, alerts: [] });
    } catch (err) {
      console.warn('Lỗi kiểm tra tương tác thuốc:', err);
    } finally {
      setCheckingInteractions(false);
    }
  };

  useEffect(() => {
    if (exam?.id) {
      checkDrugSafety(prescriptions, prescForm.medicationId);
    }
  }, [prescriptions, prescForm.medicationId, exam?.id]);

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!prescForm.medicationId) return toast.error('Vui lòng chọn thuốc');

    const selectedMed = medications.find(m => m.id == prescForm.medicationId);
    const medName = selectedMed?.name || prescForm.medicationId;

    // Check if adding this medication triggers CRITICAL allergy or interaction
    if (drugAlerts.hasCriticalAlert) {
      const criticals = drugAlerts.alerts.filter(a => a.severity === 'CRITICAL');
      if (criticals.length > 0) {
        const confirmMsg = `🚨 CẢNH BÁO AN TOÀN DƯỢC LÂM SÀNG:\n\n${criticals.map(c => `• ${c.title}:\n  ${c.description}\n  👉 Khuyến nghị: ${c.clinicalAdvice}`).join('\n\n')}\n\nBác sĩ có chắc chắn muốn thêm thuốc này vào đơn?`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }
    }

    try {
      setPrescriptions([...prescriptions, { ...prescForm, medicationName: medName, id: Date.now() }]);
      setPrescForm({ medicationId: '', dosage: '', frequency: '', duration: '', quantity: '', instruction: '' });
      toast.success(`Đã thêm ${medName} vào đơn`);
    } catch (e) {}
  };

  const handleSavePrescriptionList = async () => {
    if (prescriptions.length === 0) return toast.error('Đơn thuốc trống');
    try {
      const normalizedItems = prescriptions
        .map(p => {
          const medId = p.medicationId || medications.find(m => m.name === p.medicationName)?.id;
          return medId ? {
            medicationId: Number(medId),
            dosage: p.dosage,
            frequency: p.frequency,
            duration: p.duration,
            quantity: Math.max(1, parseInt(p.quantity, 10) || 1),
            instruction: p.instruction
          } : null;
        })
        .filter(Boolean);

      await api.post(`/api/prescriptions?examId=${exam.id}`, {
        diagnosis: examForm.diagnosis,
        notes: examForm.conclusion || examForm.notes,
        items: normalizedItems
      });
      toast.success('Đã lưu đơn thuốc & đồng bộ sang hóa đơn viện phí');
    } catch (e) { toast.error(e?.message || 'Lỗi lưu đơn thuốc'); }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/follow-ups?examId=${exam.id}`, followUpForm);
      toast.success('Đã tạo lịch tái khám');
      setFollowUpForm({ scheduledDate: '', notes: '' });
    } catch (e) { toast.error('Lỗi tạo lịch tái khám'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-7.5rem)] rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      
      {/* LEFT COLUMN: Queue */}
      <div className="w-full lg:w-1/4 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col max-h-72 lg:max-h-none lg:h-full">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <User size={17} className="text-blue-600" /> Hàng đợi ({queue.length})
          </h2>
          <button onClick={callNext} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-2xs">
            Gọi tiếp theo
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar">
          {queue.map(q => {
            const isSelected = exam && (exam.id === q.id || exam.queueTicketId === q.id || exam.ticketId === q.id);
            return (
              <div 
                key={q.id} 
                onClick={() => {
                  fetchExamDetails(q.id);
                  navigate(`/doctor/examination/${q.id}`);
                }}
                className={`p-3 mb-2 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500/30' 
                    : q.status === 'CALLED' || q.status === 'IN_EXAM'
                    ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-black text-xs ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                    Số {q.queueNumber}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : q.status === 'IN_EXAM' || q.status === 'CALLED'
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isSelected ? 'Đang chọn' : q.status === 'IN_EXAM' ? 'Đang khám' : q.status === 'CALLED' ? 'Đã gọi' : 'Đang chờ'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="text-xs font-bold text-slate-900 truncate">{q.patientName}</div>
                  {(q.triageLevel === 'RED' || q.triageLevel === 'EMERGENCY') && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-black">CẤP CỨU</span>
                  )}
                  {q.isReturnPatient && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold">CÓ KQ CLS</span>
                  )}
                </div>
                {q.roomName && <div className="text-[10px] text-slate-400 mt-0.5">{q.roomName}</div>}
              </div>
            );
          })}
          {queue.length === 0 && <div className="text-center text-sm text-slate-400 mt-10">Không có bệnh nhân chờ</div>}
        </div>
      </div>

      {/* CENTER COLUMN: Examination Form */}
      <div className="w-full lg:w-2/4 flex flex-col lg:h-full bg-white relative">
        {exam ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white shadow-xs z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">{exam.patientName}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      #{exam.patientCode}
                    </span>
                    {(exam.triageLevel === 'RED' || exam.triageLevel === 'EMERGENCY') && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-2xs">
                        🚨 Phân loại Đỏ (Cấp cứu)
                      </span>
                    )}
                    {(exam.triageLevel === 'YELLOW' || exam.triageLevel === 'URGENT') && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⚡ Ưu tiên (Vàng)
                      </span>
                    )}
                    {exam.patientBloodType && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        🩸 Nhóm {exam.patientBloodType}
                      </span>
                    )}
                    {exam.patientAllergies && !exam.patientAllergies.toLowerCase().includes('không') && !exam.patientAllergies.toLowerCase().includes('chưa') && exam.patientAllergies.toLowerCase() !== 'none' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 shadow-2xs animate-pulse">
                        ⚠️ Dị ứng: {exam.patientAllergies}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Chưa ghi nhận dị ứng
                      </span>
                    )}
                  </div>
                  {exam.patientMedicalHistory && (
                    <div className="mt-1 text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 inline-flex items-center gap-1.5">
                      <span className="font-bold">🩺 Tiền sử bệnh lý:</span> {exam.patientMedicalHistory}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-1 flex gap-4">
                    <span>Bác sĩ phụ trách: <span className="font-semibold text-slate-700">{exam.doctorName}</span></span>
                    {exam.startedAt && <span>Bắt đầu: <span className="font-medium text-slate-600">{dayjs(exam.startedAt).format('HH:mm - DD/MM')}</span></span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowPrescModal(true)} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold border border-teal-200 transition-colors shadow-2xs"
                  >
                    <Printer size={15} /> In Đơn Thuốc
                  </button>
                  <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <FileSearch size={15} /> Lịch sử ({history.length})
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {/* History Expandable */}
              {showHistory && (
                <div className="mb-6 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-sm animate-in fade-in duration-150">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <FileSearch size={16} /> Lịch sử khám bệnh trước đây
                  </h3>
                  {history.length > 0 ? history.map(h => (
                    <div key={h.id} className="border-b border-amber-200/50 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                      <div className="text-slate-500 text-xs">{dayjs(h.startedAt).format('DD/MM/YYYY')} · BS. {h.doctorName}</div>
                      <div className="font-semibold text-slate-800">{h.diagnosis}</div>
                      {h.conclusion && <div className="text-xs text-slate-600 italic">{h.conclusion}</div>}
                    </div>
                  )) : <div className="text-slate-500 text-xs">Chưa có lịch sử khám trước đó.</div>}
                </div>
              )}

              {/* Vitals */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Activity size={18} className="text-rose-500"/> Chỉ số sinh tồn (Vitals)
                  </h3>
                  <div className="flex items-center gap-2">
                    {exam.spO2 && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                        SpO₂: {exam.spO2}%
                      </span>
                    )}
                    {examForm.bloodPressure && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                        HA: {examForm.bloodPressure}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Huyết áp (mmHg)</label>
                    <input type="text" className="w-full border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-blue-500"
                      placeholder="VD: 120/80"
                      value={examForm.bloodPressure} onChange={e => setExamForm({...examForm, bloodPressure: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nhịp tim (bpm)</label>
                    <input type="number" className="w-full border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-blue-500"
                      placeholder="VD: 75"
                      value={examForm.heartRate} onChange={e => setExamForm({...examForm, heartRate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nhiệt độ (°C)</label>
                    <input type="number" step="0.1" className="w-full border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-blue-500"
                      placeholder="VD: 36.5"
                      value={examForm.temperature} onChange={e => setExamForm({...examForm, temperature: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Cân nặng (kg)</label>
                    <input type="number" step="0.1" className="w-full border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-blue-500"
                      placeholder="VD: 60"
                      value={examForm.weight} onChange={e => setExamForm({...examForm, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Chiều cao (cm)</label>
                    <input type="number" className="w-full border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-blue-500"
                      placeholder="VD: 168"
                      value={examForm.height} onChange={e => setExamForm({...examForm, height: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Stethoscope size={16} className="text-teal-600"/> Triệu chứng lâm sàng</span>
                    <span className="text-[11px] text-slate-400 font-normal">Nhấp chọn gợi ý nhanh:</span>
                  </label>
                  <textarea rows={2} className="w-full border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                    value={examForm.symptoms} onChange={e => setExamForm({...examForm, symptoms: e.target.value})} placeholder="Mô tả lý do khám, triệu chứng và tiền sử bệnh..." />
                  {/* Quick Symptoms Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {COMMON_SYMPTOMS.map((sym, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setExamForm(prev => ({
                          ...prev,
                          symptoms: prev.symptoms ? `${prev.symptoms}, ${sym}` : sym
                        }))}
                        className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                      >
                        + {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>Chẩn đoán bệnh (ICD-10)</span>
                    <span className="text-[11px] text-slate-400 font-normal">Gợi ý mã bệnh:</span>
                  </label>
                  <textarea rows={2} className="w-full border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500 p-3 font-semibold text-slate-800"
                    value={examForm.diagnosis} onChange={e => setExamForm({...examForm, diagnosis: e.target.value})} placeholder="Nhập chẩn đoán hoặc chọn mã ICD..." />
                  {/* Quick ICD-10 Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {COMMON_ICD.map((icd, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setExamForm(prev => ({ ...prev, diagnosis: icd }))}
                        className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium"
                      >
                        {icd}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">Ghi chú lâm sàng</label>
                    <textarea rows={2} className="w-full border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      value={examForm.notes} onChange={e => setExamForm({...examForm, notes: e.target.value})} placeholder="Ghi chú thêm về diễn tiến bệnh..." />
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">Kết luận & Lời dặn</label>
                    <textarea rows={2} className="w-full border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      value={examForm.conclusion} onChange={e => setExamForm({...examForm, conclusion: e.target.value})} placeholder="Chế độ ăn uống, sinh hoạt, nghỉ ngơi..." />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-end gap-3 pb-8">
                <button 
                  onClick={() => setShowPrescModal(true)} 
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Printer size={16} /> Xem & In Đơn Thuốc
                </button>
                <button onClick={handleUpdateExam} className="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-semibold text-sm transition-colors">
                  Lưu tạm
                </button>
                <button onClick={handleCompleteExam} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors">
                  <CheckCircle size={18} /> Hoàn thành khám
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chọn bệnh nhân để bắt đầu khám</p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Quick Actions */}
      <div className="w-full lg:w-1/4 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col lg:h-full overflow-hidden">
        {exam ? (
          <div className="flex-1 overflow-y-auto">
            {/* Lab Orders */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Chỉ định cận lâm sàng</h3>
              <form onSubmit={handleAddLabOrder} className="space-y-2 mb-4">
                <select className="w-full text-sm border-gray-300 rounded-md" required
                  value={labForm.labTestId} onChange={e => setLabForm({...labForm, labTestId: e.target.value})}>
                  <option value="">-- Chọn xét nghiệm --</option>
                  {labTests.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.price ? `(${Number(t.price).toLocaleString('vi-VN')}đ)` : ''}
                    </option>
                  ))}
                </select>
                <input type="text" placeholder="Ghi chú thêm..." className="w-full text-sm border-gray-300 rounded-md"
                  value={labForm.notes} onChange={e => setLabForm({...labForm, notes: e.target.value})} />
                <button type="submit" className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-100 flex justify-center items-center gap-1 transition-colors">
                  <Plus size={14} /> Thêm chỉ định XN
                </button>
              </form>
              <div className="space-y-2">
                {orders.map((o, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{o.testName}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {o.status === 'COMPLETED' ? '✓ Có kết quả' : '⏳ Chờ KQ'}
                      </span>
                    </div>
                    {o.status === 'COMPLETED' && (o.resultValue || o.result || o.attachmentUrl) && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 space-y-1 text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>KQ: <strong className="text-blue-700">{o.resultValue || o.result}</strong> {o.unit || ''}</span>
                          {o.isAbnormal && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              ⚠️ Bất thường
                            </span>
                          )}
                        </div>
                        {o.resultText && (
                          <p className="text-[11px] text-slate-500">{o.resultText}</p>
                        )}
                        {/* [Tạm thời comment chức năng xem ảnh / phim chụp X-quang]
                        {o.attachmentUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewLabOrder(o)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 mt-1"
                          >
                            <ImageIcon size={12} /> Xem phim chụp / Ảnh kết quả
                          </button>
                        )}
                        */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Pill size={18} className="text-teal-600"/> Kê đơn thuốc
                </h3>
                {prescriptions.length > 0 && (
                  <button 
                    onClick={() => setShowPrescModal(true)}
                    className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                  >
                    <Printer size={13} /> Mẫu in
                  </button>
                )}
              </div>
              <form onSubmit={handleAddPrescription} className="space-y-2 mb-4">
                <select className="w-full text-xs border-slate-200 rounded-xl" required
                  value={prescForm.medicationId} onChange={e => setPrescForm({...prescForm, medicationId: e.target.value})}>
                  <option value="">-- Chọn dược phẩm --</option>
                  {medications.map(m => <option key={m.id} value={m.id}>{m.name} ({m.dosageForm || 'Thuốc'})</option>)}
                </select>
                <div className="flex gap-2">
                  <input type="text" placeholder="Liều lượng (VD: 1 viên)" required className="w-1/2 text-xs border-slate-200 rounded-xl"
                    value={prescForm.dosage} onChange={e => setPrescForm({...prescForm, dosage: e.target.value})} />
                  <input type="number" min="1" placeholder="Số lượng" required className="w-1/2 text-xs border-slate-200 rounded-xl"
                    value={prescForm.quantity} onChange={e => setPrescForm({...prescForm, quantity: e.target.value})} />
                </div>
                <input type="text" placeholder="Cách dùng (VD: Sáng 1, Tối 1 sau ăn)" required className="w-full text-xs border-slate-200 rounded-xl"
                  value={prescForm.instruction} onChange={e => setPrescForm({...prescForm, instruction: e.target.value})} />
                <button type="submit" className="w-full bg-teal-50 text-teal-700 border border-teal-200 py-1.5 rounded-xl text-xs font-bold hover:bg-teal-100 flex justify-center items-center gap-1 transition-colors">
                  <Plus size={14} /> Thêm vào đơn
                </button>
              </form>

              {/* Real-time Clinical Drug Safety & Allergy Alert Box */}
              {checkingInteractions && (
                <div className="mb-3 text-[11px] text-slate-500 flex items-center gap-1.5 animate-pulse bg-slate-100 p-2 rounded-xl">
                  <Sparkles size={13} className="text-teal-600 animate-spin" />
                  Đang kiểm tra tương tác thuốc & tiền sử dị ứng...
                </div>
              )}

              {drugAlerts.totalAlerts > 0 && (
                <div className={`mb-3 p-3 rounded-2xl border transition-all ${
                  drugAlerts.hasCriticalAlert
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/20'
                    : 'bg-amber-50 border-amber-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase tracking-wide flex items-center gap-1.5 ${
                      drugAlerts.hasCriticalAlert ? 'text-rose-700' : 'text-amber-800'
                    }`}>
                      {drugAlerts.hasCriticalAlert ? (
                        <>
                          <ShieldAlert size={16} className="text-rose-600 animate-bounce" />
                          CẢNH BÁO NGUY HIỂM ({drugAlerts.totalAlerts})
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="text-amber-600" />
                          LƯU Ý TƯƠNG TÁC THUỐC ({drugAlerts.totalAlerts})
                        </>
                      )}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      drugAlerts.hasCriticalAlert ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {drugAlerts.hasCriticalAlert ? 'CHỐNG CHỈ ĐỊNH' : 'THEO DÕI SÁT'}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {drugAlerts.alerts.map((alert, idx) => (
                      <div 
                        key={idx} 
                        className={`text-xs p-2 rounded-xl border ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-white/95 border-rose-200 text-rose-950'
                            : 'bg-white/95 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-bold text-[11px] leading-snug">
                            {alert.title}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 uppercase ${
                            alert.type === 'ALLERGY' 
                              ? 'bg-red-600 text-white' 
                              : alert.type === 'DUPLICATE'
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}>
                            {alert.type === 'ALLERGY' ? 'Dị ứng' : alert.type === 'DUPLICATE' ? 'Trùng lặp' : 'Tương tác'}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700 mb-1">
                          Thuốc: <span className="text-blue-700">{alert.medicationNames}</span>
                        </div>
                        <div className="text-[11px] text-slate-700 leading-relaxed mb-1">
                          {alert.description}
                        </div>
                        {alert.clinicalAdvice && (
                          <div className="text-[10px] text-teal-800 bg-teal-50/80 p-1.5 rounded-lg border border-teal-200/60 font-medium mt-1">
                            💡 <strong>Khuyến nghị lâm sàng:</strong> {alert.clinicalAdvice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {prescriptions.map((p, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-900">{p.medicationName || p.medicationId}</div>
                      <div className="text-slate-600 mt-0.5">{p.dosage} · SL: {p.quantity}</div>
                      <div className="text-slate-500 italic text-[11px] mt-0.5">{p.instruction}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      title="Xóa thuốc này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {prescriptions.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={handleSavePrescriptionList} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold shadow-xs transition-colors">
                    Lưu đơn thuốc
                  </button>
                  <button onClick={() => setShowPrescModal(true)} className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors">
                    <Printer size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Follow up */}
            <div className="p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <CalendarIcon size={18} className="text-purple-500"/> Lịch tái khám
              </h3>
              <form onSubmit={handleCreateFollowUp} className="space-y-2">
                <input type="date" required className="w-full text-xs border-slate-200 rounded-xl"
                  value={followUpForm.scheduledDate} onChange={e => setFollowUpForm({...followUpForm, scheduledDate: e.target.value})} />
                <textarea rows={2} placeholder="Ghi chú hẹn tái khám..." className="w-full text-xs border-slate-200 rounded-xl p-2.5"
                  value={followUpForm.notes} onChange={e => setFollowUpForm({...followUpForm, notes: e.target.value})} />
                <button type="submit" className="w-full bg-purple-50 text-purple-700 border border-purple-200 py-1.5 rounded-xl text-xs font-bold hover:bg-purple-100 flex justify-center items-center gap-1 transition-colors">
                  Tạo lịch hẹn tái khám
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 p-6 text-center text-sm">
            Thông tin hỗ trợ khám bệnh sẽ hiển thị ở đây
          </div>
        )}
      </div>

      {/* Modal In Đơn Thuốc Chuẩn Bộ Y Tế */}
      {showPrescModal && (
        <PrintPrescriptionModal
          prescription={{ items: prescriptions }}
          exam={exam}
          onClose={() => setShowPrescModal(false)}
        />
      )}

      {/* [Tạm thời comment modal xem phim chụp / hình ảnh cận lâm sàng]
      {previewLabOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">{previewLabOrder.testName} — {exam?.patientName}</h3>
                <p className="text-xs text-slate-400">{previewLabOrder.resultValue} {previewLabOrder.resultText ? `· ${previewLabOrder.resultText}` : ''}</p>
              </div>
              <button onClick={() => setPreviewLabOrder(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center max-h-[75vh] overflow-auto">
              {previewLabOrder.attachmentUrl?.toLowerCase().endsWith('.pdf') ? (
                <a
                  href={previewLabOrder.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2"
                >
                  <FileText size={16} /> Mở tệp PDF kết quả trong tab mới <ExternalLink size={14} />
                </a>
              ) : (
                <img
                  src={previewLabOrder.attachmentUrl}
                  alt={previewLabOrder.testName}
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

export default ExaminationPage;

