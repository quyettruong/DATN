import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FileText, ChevronDown, ChevronUp, QrCode, Printer, CheckCircle, Copy, AlertCircle, X, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import PrintReceiptModal from '../../components/medical/PrintReceiptModal';
import VietQRModal from '../../components/payment/VietQRModal';

const InvoiceHistoryPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  // Modals
  const [qrModalInvoice, setQrModalInvoice] = useState(null);
  const [payingLoading, setPayingLoading] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/billing/invoices/my');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setInvoices(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UNPAID': return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">CHƯA THANH TOÁN</span>;
      case 'PARTIAL': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">TRẢ MỘT PHẦN</span>;
      case 'PAID': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">ĐÃ THANH TOÁN</span>;
      case 'CANCELLED': return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">ĐÃ HỦY</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const handleConfirmQrPayment = async () => {
    if (!qrModalInvoice) return;
    setPayingLoading(true);
    try {
      await api.post(`/api/billing/invoices/${qrModalInvoice.id}/pay`, {
        paymentMethod: 'TRANSFER',
        amount: qrModalInvoice.remainingAmount || qrModalInvoice.totalAmount
      });
      toast.success('Xác nhận thanh toán thành công!');
      setQrModalInvoice(null);
      await fetchInvoices();
    } catch (err) {
      toast.error(err?.message || 'Lỗi xử lý thanh toán');
    } finally {
      setPayingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Lịch Sử Hóa Đơn & Viện Phí
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi các hóa đơn khám chữa bệnh, thanh toán trực tuyến qua VietQR 24/7 và in biên lai điện tử
        </p>
      </div>

      {loading ? (
        <div className="text-center p-16 text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm font-medium">Đang tải lịch sử hóa đơn...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-4">
            <FileText size={40} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Bạn chưa có hóa đơn viện phí nào</h2>
          <p className="text-xs text-slate-500 max-w-md">Các hóa đơn thanh toán khám bệnh, xét nghiệm hoặc thuốc sẽ hiển thị chi tiết tại đây sau khi hoàn tất ca khám.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden transition-all hover:border-blue-300">
              <div 
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-4"
                onClick={() => toggleExpand(invoice.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1.5">
                    <span className="font-mono font-black text-slate-900 text-base">{invoice.invoiceNumber}</span>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">
                    Ngày lập: <span className="font-medium text-slate-700">{dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                  </p>
                  <p className="text-xs text-slate-600 truncate">{invoice.notes || 'Hóa đơn viện phí khám bệnh'}</p>
                </div>
                <div className="flex items-center sm:flex-col sm:items-end justify-between">
                  <p className="text-xl font-black text-blue-600 sm:mb-2">{formatCurrency(invoice.totalAmount)}</p>
                  <button className="text-slate-400 hover:text-blue-600 flex items-center text-xs font-bold transition-colors">
                    {expandedId === invoice.id ? (
                      <><ChevronUp size={16} className="mr-1"/> Thu gọn</>
                    ) : (
                      <><ChevronDown size={16} className="mr-1"/> Xem chi tiết</>
                    )}
                  </button>
                </div>
              </div>
              
              {expandedId === invoice.id && (
                <div className="bg-slate-50/70 p-5 border-t border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-3 uppercase text-[11px] tracking-wider">Chi tiết các dịch vụ y tế</h4>
                  <div className="space-y-2 bg-white rounded-xl p-4 border border-slate-200/60">
                    {invoice.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 border-dashed last:border-0 text-xs">
                        <span className="text-slate-700 font-medium">
                          {item.itemName} {item.quantity > 1 ? `x${item.quantity}` : ''}
                        </span>
                        <span className="font-bold text-slate-900">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between items-center py-2 border-t border-emerald-100 text-xs text-emerald-700 font-bold">
                        <span>Quỹ BHYT / Miễn giảm chi trả</span>
                        <span>-{formatCurrency(invoice.discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="text-left">
                        <p className="text-[11px] text-slate-500">Đã thanh toán</p>
                        <p className="font-bold text-emerald-600 text-sm">{formatCurrency(invoice.paidAmount)}</p>
                      </div>
                      {invoice.remainingAmount > 0 && (
                        <div className="text-left">
                          <p className="text-[11px] text-slate-500">Còn lại cần thanh toán</p>
                          <p className="font-black text-rose-600 text-base">{formatCurrency(invoice.remainingAmount)}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {invoice.status === 'PAID' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptInvoice(invoice);
                          }}
                          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Printer size={15} /> In Biên Lai Điện Tử
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrModalInvoice(invoice);
                          }}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                        >
                          <QrCode size={16} /> Thanh Toán VietQR Ngay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Quét Mã VietQR NAPAS 247 */}
      {qrModalInvoice && (
        <VietQRModal
          isOpen={!!qrModalInvoice}
          onClose={() => setQrModalInvoice(null)}
          onSuccess={handleConfirmQrPayment}
          amount={qrModalInvoice.remainingAmount || qrModalInvoice.totalAmount}
          memo={`MEDICARE ${qrModalInvoice.invoiceNumber}`}
          title="Thanh Toán Viện Phí VietQR"
          subTitle={`Hóa đơn ${qrModalInvoice.invoiceNumber} - ${qrModalInvoice.patientName || 'Bệnh nhân'}`}
        />
      )}

      {/* Modal In Biên Lai */}
      {receiptInvoice && (
        <PrintReceiptModal
          invoice={receiptInvoice}
          onClose={() => setReceiptInvoice(null)}
        />
      )}
    </div>
  );
};

export default InvoiceHistoryPage;

