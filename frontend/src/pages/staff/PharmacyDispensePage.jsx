import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import {
  Pill,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  PackageCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import PrintPrescriptionModal from '../../components/medical/PrintPrescriptionModal';

const PharmacyDispensePage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispensingId, setDispensingId] = useState(null);
  const [tab, setTab] = useState('ACTIVE'); // ACTIVE | DISPENSED | ALL
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedForPrint, setSelectedForPrint] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/pharmacy/prescriptions');
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setPrescriptions(data);
      if (data.length > 0 && expandedId === null) {
        const firstActive = data.find(p => p.status !== 'DISPENSED');
        if (firstActive) setExpandedId(firstActive.id);
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể tải danh sách đơn thuốc tại quầy dược');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescription) => {
    if (prescription.status === 'DISPENSED') {
      return toast.error('Đơn thuốc này đã được xuất kho trước đó');
    }

    const shortageItem = (prescription.items || []).find(
      item => (item.availableStock ?? 0) < (item.quantity || 1)
    );
    if (shortageItem) {
      return toast.error(
        `Không đủ tồn kho cho thuốc "${shortageItem.medicationName}" (Cần ${shortageItem.quantity}, còn ${shortageItem.availableStock ?? 0})`
      );
    }

    if (prescription.invoiceStatus && prescription.invoiceStatus !== 'PAID') {
      const proceedUnpaid = window.confirm(
        `Hóa đơn viện phí của bệnh nhân ${prescription.patientName} hiện ở trạng thái "${
          prescription.invoiceStatus === 'PARTIAL' ? 'Thu 1 phần' : 'Chưa thu tiền'
        }".\n\nBạn có chắc chắn muốn xuất thuốc và trừ tồn kho (FEFO) ngay bây giờ?`
      );
      if (!proceedUnpaid) return;
    } else {
      const confirmDispense = window.confirm(
        `Xác nhận xuất thuốc theo chuẩn FEFO (ưu tiên lô cận hạn dùng trước) cho bệnh nhân ${prescription.patientName}?`
      );
      if (!confirmDispense) return;
    }

    setDispensingId(prescription.id);
    try {
      await api.post(`/api/pharmacy/prescriptions/${prescription.id}/dispense`);
      toast.success(`Đã xuất thuốc & trừ kho FEFO thành công cho ${prescription.patientName}!`);
      await fetchPrescriptions();
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi xuất thuốc từ kho dược');
    } finally {
      setDispensingId(null);
    }
  };

  const pendingCount = prescriptions.filter(p => p.status !== 'DISPENSED' && p.status !== 'CANCELLED').length;
  const dispensedCount = prescriptions.filter(p => p.status === 'DISPENSED').length;
  const shortagePrescCount = prescriptions.filter(
    p => p.status !== 'DISPENSED' && (p.items || []).some(i => (i.availableStock ?? 0) < (i.quantity || 1))
  ).length;

  const filteredList = prescriptions.filter(p => {
    const matchesTab =
      tab === 'ALL'
        ? true
        : tab === 'DISPENSED'
        ? p.status === 'DISPENSED'
        : p.status !== 'DISPENSED' && p.status !== 'CANCELLED';

    const kw = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !kw ||
      p.patientName?.toLowerCase().includes(kw) ||
      p.patientCode?.toLowerCase().includes(kw) ||
      p.doctorName?.toLowerCase().includes(kw) ||
      p.diagnosis?.toLowerCase().includes(kw) ||
      String(p.id).includes(kw);

    return matchesTab && matchesSearch;
  });

  const getInvoiceBadge = (status) => {
    if (status === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CreditCard className="w-3 h-3" /> Đã thu viện phí
        </span>
      );
    }
    if (status === 'PARTIAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <CreditCard className="w-3 h-3" /> Thu 1 phần
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <CreditCard className="w-3 h-3" /> Chưa thu tiền
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Pill className="w-7 h-7 text-teal-600" />
            <span>Quầy Dược & Cấp Phát Thuốc Ngoại Trú</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Đối chiếu đơn thuốc điện tử, kiểm tra thanh toán viện phí và xuất kho tự động theo nguyên tắc FEFO
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPrescriptions}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đơn chờ cấp phát</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount} đơn</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đã xuất kho hoàn tất</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{dispensedCount} đơn</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đơn thiếu tồn kho khả dụng</p>
            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{shortagePrescCount} đơn</h3>
          </div>
        </div>
      </div>

      {/* Filter & Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 self-start">
            <button
              onClick={() => setTab('ACTIVE')}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === 'ACTIVE' ? 'bg-white text-teal-700 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              Chờ Phát Thuốc ({pendingCount})
            </button>
            <button
              onClick={() => setTab('DISPENSED')}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === 'DISPENSED' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              Đã Xuất Kho ({dispensedCount})
            </button>
            <button
              onClick={() => setTab('ALL')}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === 'ALL' ? 'bg-white text-blue-700 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              Tất Cả ({prescriptions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm mã BN, tên bệnh nhân, bác sĩ, chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="py-14 text-center text-slate-400 text-sm">Đang tải danh sách đơn thuốc...</div>
        ) : filteredList.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-sm">
            Không có đơn thuốc nào trong mục này.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((presc) => {
              const isExpanded = expandedId === presc.id;
              const isDispensed = presc.status === 'DISPENSED';
              const hasAllergy =
                presc.patientAllergies &&
                !presc.patientAllergies.toLowerCase().includes('không') &&
                !presc.patientAllergies.toLowerCase().includes('chưa') &&
                presc.patientAllergies.toLowerCase() !== 'none';
              const hasShortage = (presc.items || []).some(
                i => (i.availableStock ?? 0) < (i.quantity || 1)
              );

              return (
                <div
                  key={presc.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isDispensed
                      ? 'border-slate-200 bg-slate-50/40'
                      : hasShortage
                      ? 'border-rose-200 bg-white'
                      : 'border-slate-200 bg-white hover:border-teal-300'
                  }`}
                >
                  {/* Summary Header */}
                  <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : presc.id)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                          #RX-{String(presc.id).padStart(6, '0')}
                        </span>
                        <span className="font-black text-sm text-slate-900 uppercase">
                          {presc.patientName}
                        </span>
                        {presc.patientCode && (
                          <span className="text-xs font-mono text-slate-500">
                            ({presc.patientCode})
                          </span>
                        )}
                        {getInvoiceBadge(presc.invoiceStatus)}
                        {isDispensed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã phát thuốc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5" /> Chờ cấp phát
                          </span>
                        )}
                        {hasAllergy && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <ShieldAlert className="w-3 h-3" /> Dị ứng: {presc.patientAllergies}
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          Chẩn đoán: <strong className="text-slate-800">{presc.diagnosis || 'Ngoại trú'}</strong>
                        </span>
                        <span>
                          BS kê đơn: <strong className="text-slate-700">{presc.doctorName}</strong>
                        </span>
                        <span>
                          Số khoản: <strong className="text-teal-700">{presc.items?.length || 0} loại thuốc</strong>
                        </span>
                        <span>
                          {dayjs(presc.prescribedAt || presc.createdAt).format('DD/MM/YYYY HH:mm')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => setSelectedForPrint(presc)}
                        title="In đơn thuốc"
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {!isDispensed && (
                        <button
                          type="button"
                          disabled={dispensingId === presc.id || hasShortage}
                          onClick={() => handleDispense(presc)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs ${
                            hasShortage
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>
                            {dispensingId === presc.id ? 'Đang trừ kho...' : 'Xuất Thuốc & Trừ Kho (FEFO)'}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : presc.id)}
                        className="p-2 text-slate-400 hover:text-slate-700"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Medication Items */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                              <th className="py-2 px-2">STT</th>
                              <th className="py-2 px-2">Tên thuốc & Dạng bào chế</th>
                              <th className="py-2 px-2">Liều dùng & Hướng dẫn</th>
                              <th className="py-2 px-2 text-center">SL Kê</th>
                              <th className="py-2 px-2 text-center">Tồn Kho Khả Dụng</th>
                              <th className="py-2 px-2 text-right">Thành Tiền Dự Kiến</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60">
                            {(presc.items || []).map((item, idx) => {
                              const enough = (item.availableStock ?? 0) >= (item.quantity || 1);
                              const estTotal = (item.quantity || 1) * (item.unitPrice || 0);
                              return (
                                <tr key={item.id || idx} className="bg-white/60">
                                  <td className="py-2.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                                  <td className="py-2.5 px-2">
                                    <div className="font-bold text-slate-900">{item.medicationName}</div>
                                    {item.dosageForm && (
                                      <div className="text-[10px] text-slate-400 uppercase">{item.dosageForm}</div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 text-slate-600">
                                    <div>
                                      <span className="font-semibold text-slate-800">{item.dosage}</span>
                                      {item.frequency ? ` · ${item.frequency}` : ''}
                                      {item.duration ? ` (${item.duration})` : ''}
                                    </div>
                                    {item.instruction && (
                                      <div className="text-[11px] text-slate-500 italic">{item.instruction}</div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-black text-slate-900 text-sm">
                                    {item.quantity}
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    {isDispensed ? (
                                      <span className="text-[11px] font-semibold text-slate-500">
                                        Còn tồn: {item.availableStock ?? 0}
                                      </span>
                                    ) : enough ? (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Đủ hàng (Tồn: {item.availableStock})
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                        Thiếu hàng (Tồn: {item.availableStock ?? 0})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-semibold text-slate-800">
                                    {estTotal > 0 ? `${estTotal.toLocaleString('vi-VN')} đ` : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedForPrint && (
        <PrintPrescriptionModal
          prescription={selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
        />
      )}
    </div>
  );
};

export default PharmacyDispensePage;
