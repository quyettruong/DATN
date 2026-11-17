import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Plus,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import PrintReceiptModal from '../../components/medical/PrintReceiptModal';

const BillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL'); // ALL, UNPAID, PAID
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ unpaidCount: 0, todayPaid: 0, todayRevenue: 0 });

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Payment & BHYT discount form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, TRANSFER, CARD
  const [paymentNotes, setPaymentNotes] = useState('');
  const [bhytCode, setBhytCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [processing, setProcessing] = useState(false);

  // New Invoice Form
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    patientName: '',
    patientPhone: '',
    patientCode: '',
    consultationFee: 150000,
    labFee: 0,
    medicationFee: 0,
    notes: 'Phí khám & dịch vụ y tế'
  });
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let list = [];
      try {
        const res = await api.get('/api/billing/invoices');
        list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        const resUnpaid = await api.get('/api/billing/invoices/unpaid');
        list = Array.isArray(resUnpaid) ? resUnpaid : (Array.isArray(resUnpaid?.data) ? resUnpaid.data : []);
      }

      setInvoices(list);

      const unpaid = list.filter(i => i.status === 'UNPAID' || i.status === 'PARTIAL').length;
      const todayPaidCount = list.filter(i => i.status === 'PAID').length;
      const todayRev = list.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);

      setStats({
        unpaidCount: unpaid,
        todayPaid: todayPaidCount,
        todayRevenue: todayRev
      });
    } catch (error) {
      toast.error(error?.message || 'Lỗi tải danh sách hóa đơn viện phí');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    const rem = invoice.remainingAmount != null ? invoice.remainingAmount : invoice.totalAmount;
    setPaymentAmount(String(rem || 0));
    setPaymentMethod('CASH');
    setPaymentNotes(invoice.notes || '');
    setBhytCode('');
    setShowPayModal(true);
  };

  const handleApplyDiscountPercent = async (percent) => {
    if (!selectedInvoice) return;
    setApplyingDiscount(true);
    try {
      const res = await api.post(`/api/billing/invoices/${selectedInvoice.id}/discount`, {
        discountPercent: percent,
        bhytCode: bhytCode || undefined,
        notes: percent > 0 ? `Miễn giảm BHYT ${percent}%${bhytCode ? ` (${bhytCode})` : ''}` : 'Không áp dụng giảm trừ'
      });
      const updated = res?.data || res;
      if (updated && updated.id) {
        setSelectedInvoice(updated);
        const rem = updated.remainingAmount != null ? updated.remainingAmount : updated.totalAmount;
        setPaymentAmount(String(rem || 0));
        toast.success(percent > 0 ? `Đã áp dụng mức hưởng BHYT ${percent}%!` : 'Đã gỡ giảm trừ BHYT');
        fetchData();
      }
    } catch (err) {
      toast.error(err?.message || 'Không thể áp dụng giảm trừ BHYT');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handlePrintReceiptClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (paymentAmount === '' || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      return toast.error('Vui lòng nhập số tiền thanh toán hợp lệ');
    }

    if (Number(paymentAmount) > (selectedInvoice.remainingAmount + 1) && selectedInvoice.remainingAmount > 0) {
      return toast.error('Số tiền không được vượt quá số tiền còn lại');
    }

    setProcessing(true);
    try {
      const res = await api.post(`/api/billing/invoices/${selectedInvoice.id}/pay`, {
        amount: Number(paymentAmount),
        paymentMethod,
        notes: paymentNotes
      });
      const updated = res?.data || res;

      toast.success('Xác nhận thanh toán viện phí thành công!');
      setShowPayModal(false);
      setSelectedInvoice(updated || {
        ...selectedInvoice,
        paidAmount: (Number(selectedInvoice.paidAmount) || 0) + Number(paymentAmount),
        remainingAmount: Math.max(0, Number(selectedInvoice.remainingAmount) - Number(paymentAmount)),
        status: 'PAID',
        paymentMethod
      });
      setShowReceiptModal(true);
      fetchData();
    } catch (error) {
      toast.error(error?.message || 'Lỗi xác nhận thanh toán viện phí');
    } finally {
      setProcessing(false);
    }
  };

  // Create new invoice via real Backend API
  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!newInvoiceForm.patientCode.trim() && !newInvoiceForm.patientName.trim()) {
      return toast.error('Vui lòng nhập mã bệnh nhân hoặc họ tên');
    }

    setCreatingInvoice(true);
    try {
      const res = await api.post('/api/billing/invoices', {
        patientCode: newInvoiceForm.patientCode.trim() || undefined,
        patientName: newInvoiceForm.patientName.trim() || undefined,
        patientPhone: newInvoiceForm.patientPhone.trim() || undefined,
        consultationFee: Number(newInvoiceForm.consultationFee) || 0,
        labFee: Number(newInvoiceForm.labFee) || 0,
        medicationFee: Number(newInvoiceForm.medicationFee) || 0,
        notes: newInvoiceForm.notes
      });
      const created = res?.data || res;
      toast.success(`Đã lập hóa đơn ${created?.invoiceNumber || ''} thành công!`);
      setShowCreateModal(false);
      setNewInvoiceForm({
        patientName: '',
        patientPhone: '',
        patientCode: '',
        consultationFee: 150000,
        labFee: 0,
        medicationFee: 0,
        notes: 'Phí khám & dịch vụ y tế'
      });
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi lập hóa đơn mới');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesTab =
      tab === 'ALL' ? true :
      tab === 'UNPAID' ? (inv.status === 'UNPAID' || inv.status === 'PARTIAL') :
      tab === 'PAID' ? inv.status === 'PAID' : true;

    const matchesSearch = !searchTerm ||
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientCode?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UNPAID': return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">CHƯA THU</span>;
      case 'PARTIAL': return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">THU 1 PHẦN</span>;
      case 'PAID': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">✓ ĐÃ THU</span>;
      case 'CANCELLED': return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">ĐÃ HỦY</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            <span>Quản Lý Thu Ngân & Viện Phí</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Tổng hợp tự động phí khám, cận lâm sàng, đơn thuốc, áp dụng BHYT và thanh toán VietQR
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={fetchData}
            title="Làm mới danh sách"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Lập Hóa Đơn Mới</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Hóa đơn chưa thu</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.unpaidCount} phiếu</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đã thanh toán đủ</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.todayPaid} phiếu</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Tổng doanh thu thực thu</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-700 mt-0.5">{formatCurrency(stats.todayRevenue)}</h3>
          </div>
        </div>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 self-start">
            <button
              onClick={() => setTab('ALL')}
              className={`px-4 py-2 rounded-xl transition-all ${tab === 'ALL' ? 'bg-white text-blue-600 shadow-xs font-black' : 'hover:text-slate-900'}`}
            >
              Tất Cả ({invoices.length})
            </button>
            <button
              onClick={() => setTab('UNPAID')}
              className={`px-4 py-2 rounded-xl transition-all ${tab === 'UNPAID' ? 'bg-white text-rose-600 shadow-xs font-black' : 'hover:text-slate-900'}`}
            >
              Chưa Thu ({invoices.filter(i => i.status === 'UNPAID' || i.status === 'PARTIAL').length})
            </button>
            <button
              onClick={() => setTab('PAID')}
              className={`px-4 py-2 rounded-xl transition-all ${tab === 'PAID' ? 'bg-white text-emerald-600 shadow-xs font-black' : 'hover:text-slate-900'}`}
            >
              Đã Thu ({invoices.filter(i => i.status === 'PAID').length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo mã HĐ, tên bệnh nhân, mã BN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* ── Bảng Hóa Đơn ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 font-bold">Mã HĐ</th>
                <th className="py-3 px-3 font-bold">Bệnh Nhân</th>
                <th className="py-3 px-3 font-bold">Chi Tiết Khoản Thu</th>
                <th className="py-3 px-3 font-bold text-right">Tổng Tiền</th>
                <th className="py-3 px-3 font-bold text-right">Đã Thu</th>
                <th className="py-3 px-3 font-bold text-right">Còn Lại</th>
                <th className="py-3 px-3 font-bold text-center">Trạng Thái</th>
                <th className="py-3 px-3 font-bold text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Đang tải danh sách hóa đơn...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Không tìm thấy hóa đơn nào phù hợp.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-blue-900">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{dayjs(inv.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{inv.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">#{inv.patientCode}</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 space-y-0.5">
                      <div>Khám: <strong>{formatCurrency(inv.consultationFee)}</strong></div>
                      {(inv.labFee > 0 || inv.medicationFee > 0) && (
                        <div className="text-slate-500">
                          {inv.labFee > 0 ? `XN: ${formatCurrency(inv.labFee)}` : ''}
                          {inv.labFee > 0 && inv.medicationFee > 0 ? ' · ' : ''}
                          {inv.medicationFee > 0 ? `Thuốc: ${formatCurrency(inv.medicationFee)}` : ''}
                        </div>
                      )}
                      {inv.discountAmount > 0 && (
                        <div className="text-emerald-700 font-bold">
                          Giảm BHYT: -{formatCurrency(inv.discountAmount)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-rose-600">
                      {formatCurrency(inv.remainingAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {inv.status !== 'PAID' ? (
                          <button
                            type="button"
                            onClick={() => handlePayClick(inv)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs"
                          >
                            Thu Tiền
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handlePrintReceiptClick(inv)}
                          title="In Biên Lai Thu Tiền"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: THU TIỀN, BHYT & XÁC NHẬN VIETQR ── */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Xác Nhận Thu Viện Phí & BHYT</h3>
                <p className="text-xs text-slate-400 font-mono">Hóa đơn: {selectedInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* Thông tin bệnh nhân & số tiền */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Bệnh nhân</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.patientName}</p>
                  <p className="text-slate-500 font-mono">Mã BN: {selectedInvoice.patientCode}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Số tiền cần thu</span>
                  <p className="font-black text-lg text-rose-600 mt-0.5">
                    {formatCurrency(selectedInvoice.remainingAmount ?? selectedInvoice.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Bảng kê chi tiết các hạng mục tự động */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-700 uppercase text-[10px]">
                    Bảng kê dịch vụ khám, cận lâm sàng & thuốc
                  </div>
                  <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                    {selectedInvoice.items.map((it, idx) => (
                      <div key={it.id || idx} className="px-3.5 py-2 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-800">{it.itemName}</span>
                          <span className="text-slate-400 ml-1.5">x{it.quantity || 1}</span>
                        </div>
                        <span className="font-bold text-slate-900">{formatCurrency(it.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="px-3.5 py-2 bg-emerald-50 border-t border-emerald-100 flex justify-between items-center text-emerald-800 font-bold">
                      <span>Quỹ BHYT / Miễn giảm chi trả:</span>
                      <span>-{formatCurrency(selectedInvoice.discountAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Khối Áp dụng Bảo hiểm Y tế (BHYT) */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Áp dụng mức hưởng Bảo hiểm Y tế (BHYT)
                  </span>
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập mã thẻ BHYT (VD: DN4791234567890 - Tùy chọn)"
                  value={bhytCode}
                  onChange={(e) => setBhytCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 bg-white font-mono text-xs uppercase"
                />
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '0% (Tự túc)', pct: 0 },
                    { label: 'BHYT 80%', pct: 80 },
                    { label: 'BHYT 95%', pct: 95 },
                    { label: 'BHYT 100%', pct: 100 }
                  ].map((opt) => (
                    <button
                      key={opt.pct}
                      type="button"
                      disabled={applyingDiscount}
                      onClick={() => handleApplyDiscountPercent(opt.pct)}
                      className="py-1.5 px-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 font-bold text-[11px] transition-colors disabled:opacity-50"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form số tiền nhập */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Số tiền thực thu (VNĐ)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-lg font-black text-blue-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phương thức thanh toán */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    💵 Tiền mặt
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TRANSFER')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      paymentMethod === 'TRANSFER'
                        ? 'bg-cyan-50 border-cyan-600 text-cyan-800 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    📲 Chuyển khoản VietQR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    💳 Thẻ POS
                  </button>
                </div>
              </div>

              {/* HỘP MÃ VIETQR ĐỘNG KHI CHỌN CHUYỂN KHOẢN */}
              {paymentMethod === 'TRANSFER' && (
                <div className="p-4 bg-gradient-to-br from-cyan-950 to-slate-900 text-white rounded-2xl border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400 flex items-center gap-1">
                      <QrCode className="w-4 h-4" /> Mã VietQR Thanh Toán Nhanh 24/7
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">NAPAS 247</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-2xl text-slate-900 border border-slate-200/80">
                    <div className="bg-white p-1.5 rounded-xl border border-blue-200 flex-shrink-0 shadow-xs">
                      <img
                        src={`https://img.vietqr.io/image/970422-0901234567-compact2.png?amount=${paymentAmount || selectedInvoice.remainingAmount || selectedInvoice.totalAmount}&addInfo=MEDICARE%20${selectedInvoice.invoiceNumber}&accountName=BENH%20VIEN%20MEDICARE`}
                        alt="Mã VietQR Thu Ngân"
                        className="w-28 h-28 object-contain rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs flex-1 w-full">
                      <p className="font-black text-sm text-blue-900">BV ĐA KHOA QUỐC TẾ MEDICARE</p>
                      <p className="text-slate-600 font-mono">
                        STK: <strong className="text-slate-900 font-bold">0901234567</strong> (MBBank)
                      </p>
                      <p className="text-slate-600">
                        Số tiền: <strong className="text-rose-600 font-black text-sm">{formatCurrency(paymentAmount)}</strong>
                      </p>
                      <p className="text-slate-600 font-mono text-[11px]">
                        Nội dung: <strong className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">MEDICARE {selectedInvoice.invoiceNumber}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú thu ngân (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Nhập ghi chú thu tiền..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-white"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={processing || Number(paymentAmount) <= 0}
                onClick={handlePaymentSubmit}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {processing ? 'Đang Xử Lý...' : 'Xác Nhận Đã Thu Tiền'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: IN BIÊN LAI THU TIỀN ── */}
      {showReceiptModal && selectedInvoice && (
        <PrintReceiptModal
          invoice={selectedInvoice}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* ── MODAL 3: LẬP HÓA ĐƠN MỚI ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-base">Lập Hóa Đơn Viện Phí Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Mã bệnh nhân <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: BN000001"
                    value={newInvoiceForm.patientCode}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, patientCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={newInvoiceForm.patientPhone}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Họ tên bệnh nhân (Ghi chú đối chiếu)
                </label>
                <input
                  type="text"
                  placeholder="VD: LÊ THỊ MAI"
                  value={newInvoiceForm.patientName}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, patientName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 uppercase font-semibold text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="font-black text-slate-800 uppercase tracking-wide block">
                  Khoản Thu Viện Phí (VNĐ)
                </span>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tiền khám chuyên khoa</label>
                  <input
                    type="number"
                    value={newInvoiceForm.consultationFee}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, consultationFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tiền xét nghiệm & CLS</label>
                  <input
                    type="number"
                    value={newInvoiceForm.labFee}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, labFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tiền thuốc theo toa</label>
                  <input
                    type="number"
                    value={newInvoiceForm.medicationFee}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, medicationFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-blue-900">
                  <span>Tổng cộng:</span>
                  <span>
                    {formatCurrency(
                      Number(newInvoiceForm.consultationFee || 0) +
                      Number(newInvoiceForm.labFee || 0) +
                      Number(newInvoiceForm.medicationFee || 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingInvoice}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {creatingInvoice ? 'Đang Lập HĐ...' : 'Lập Hóa Đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingPage;
