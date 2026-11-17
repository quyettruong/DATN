import React from 'react';
import { X, Printer, CheckCircle, FileText, Building2 } from 'lucide-react';
import dayjs from 'dayjs';

const DIGITS_VN = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

const readTripleVN = (num, showZeroHundred) => {
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;
  let parts = [];

  if (hundred > 0 || showZeroHundred) {
    parts.push(`${DIGITS_VN[hundred]} trăm`);
  }
  if (ten > 1) {
    parts.push(`${DIGITS_VN[ten]} mươi`);
    if (unit === 1) parts.push('mốt');
    else if (unit === 5) parts.push('lăm');
    else if (unit > 0) parts.push(DIGITS_VN[unit]);
  } else if (ten === 1) {
    parts.push('mười');
    if (unit === 5) parts.push('lăm');
    else if (unit > 0) parts.push(DIGITS_VN[unit]);
  } else if (ten === 0 && unit > 0) {
    if (hundred > 0 || showZeroHundred) parts.push('lẻ');
    parts.push(DIGITS_VN[unit]);
  }
  return parts.join(' ');
};

const numberToWordsVN = (num) => {
  const n = Math.round(Number(num || 0));
  if (!n || n <= 0) return 'Không đồng';
  const scales = ['', 'nghìn', 'triệu', 'tỷ'];
  const groups = [];
  let temp = n;
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }
  const words = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      const triple = readTripleVN(groups[i], i < groups.length - 1);
      words.push(scales[i] ? `${triple} ${scales[i]}` : triple);
    }
  }
  const sentence = words.join(' ').trim();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ' đồng chẵn';
};

const PrintReceiptModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none animate-in zoom-in-95 duration-200">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Biên Lai Thu Tiền Viện Phí</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>In Biên Lai</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── NỘI DUNG BIÊN LAI IN CHUẨN Y TẾ ── */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 text-xs sm:text-sm font-sans print:p-6" id="printable-receipt">
          
          {/* Header Bệnh viện */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <p className="font-black text-blue-900 text-base uppercase tracking-tight">BỆNH VIỆN ĐA KHOA QUỐC TẾ MEDICARE</p>
              <p className="text-slate-500 text-xs mt-0.5">Địa chỉ: Số 123 Đường Sức Khỏe, Quận 1, TP. Hồ Chí Minh</p>
              <p className="text-slate-500 text-xs">Hotline: 1900 1234 · MST: 0312345678</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-xs text-slate-500">Mẫu số: 01/BV-2026</span>
              <p className="font-mono font-black text-slate-900 text-sm mt-0.5">{invoice.invoiceNumber || 'INV-0001'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm')}</p>
            </div>
          </div>

          {/* Tiêu đề biên lai */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              BIÊN LAI THU TIỀN VIỆN PHÍ
            </h1>
            <p className="text-xs text-slate-500 italic">
              (Liên 1: Giao cho người bệnh thanh toán)
            </p>
          </div>

          {/* Thông tin bệnh nhân */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Họ và tên bệnh nhân:</span>
              <strong className="block text-slate-900 text-sm font-black uppercase mt-0.5">
                {invoice.patientName || 'Khách vãng lai'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Mã bệnh nhân:</span>
              <strong className="block text-blue-700 font-mono font-bold mt-0.5">
                {invoice.patientCode || 'BN-0000'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Hình thức thanh toán:</span>
              <strong className="block text-slate-800 font-bold mt-0.5">
                {invoice.paymentMethod === 'TRANSFER' || invoice.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' :
                 invoice.paymentMethod === 'CARD' ? 'Thẻ POS' : 'Tiền mặt'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Trạng thái:</span>
              <strong className="block text-emerald-600 font-bold mt-0.5">
                {invoice.status === 'PAID' ? '✓ ĐÃ THANH TOÁN ĐỦ' : '⏳ CHƯA THANH TOÁN'}
              </strong>
            </div>
          </div>

          {/* Bảng chi tiết dịch vụ */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 text-xs">
                  <th className="py-2.5 font-bold w-10">STT</th>
                  <th className="py-2.5 font-bold">Nội dung chi phí / Dịch vụ</th>
                  <th className="py-2.5 font-bold text-center w-16">SL</th>
                  <th className="py-2.5 font-bold text-right w-24">Đơn giá</th>
                  <th className="py-2.5 font-bold text-right w-28">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{it.itemName}</td>
                      <td className="py-2.5 text-center text-slate-600">{it.quantity || 1}</td>
                      <td className="py-2.5 text-right text-slate-600">{formatCurrency(it.unitPrice || it.totalPrice)}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(it.totalPrice)}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    {invoice.consultationFee > 0 && (
                      <tr>
                        <td className="py-2.5 text-slate-400">1</td>
                        <td className="py-2.5 font-semibold text-slate-800">Phí khám chuyên khoa ban đầu</td>
                        <td className="py-2.5 text-center text-slate-600">1</td>
                        <td className="py-2.5 text-right text-slate-600">{formatCurrency(invoice.consultationFee)}</td>
                        <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(invoice.consultationFee)}</td>
                      </tr>
                    )}
                    {invoice.labFee > 0 && (
                      <tr>
                        <td className="py-2.5 text-slate-400">2</td>
                        <td className="py-2.5 font-semibold text-slate-800">Chi phí xét nghiệm & Cận lâm sàng</td>
                        <td className="py-2.5 text-center text-slate-600">1</td>
                        <td className="py-2.5 text-right text-slate-600">{formatCurrency(invoice.labFee)}</td>
                        <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(invoice.labFee)}</td>
                      </tr>
                    )}
                    {invoice.medicationFee > 0 && (
                      <tr>
                        <td className="py-2.5 text-slate-400">3</td>
                        <td className="py-2.5 font-semibold text-slate-800">Chi phí thuốc & Vật tư y tế theo toa</td>
                        <td className="py-2.5 text-center text-slate-600">1</td>
                        <td className="py-2.5 text-right text-slate-600">{formatCurrency(invoice.medicationFee)}</td>
                        <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(invoice.medicationFee)}</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Tổng kết tiền */}
          <div className="border-t-2 border-slate-300 pt-3 space-y-1.5 text-xs">
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-semibold">
                <span>Miễn giảm / Quỹ BHYT chi trả:</span>
                <span>-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-600">
              <span>Tổng cộng bệnh nhân thanh toán:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Đã thanh toán:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-blue-900 pt-1 border-t border-slate-200">
              <span>SỐ TIỀN THỰC THU:</span>
              <span className="text-lg text-blue-600">{formatCurrency(invoice.paidAmount || invoice.totalAmount)}</span>
            </div>
            <p className="text-slate-500 italic text-[11px] pt-1">
              (Số tiền viết bằng chữ: {numberToWordsVN(invoice.paidAmount || invoice.totalAmount)})
            </p>
          </div>

          {/* Chữ ký hai bên */}
          <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700">NGƯỜI NỘP TIỀN</p>
              <p className="text-slate-400 text-[11px]">(Ký, ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-semibold text-slate-800">{invoice.patientName || 'Bệnh nhân'}</p>
            </div>
            <div>
              <p className="font-bold text-slate-700">NGƯỜI THU TIỀN</p>
              <p className="text-slate-400 text-[11px]">(Ký, đóng dấu thu ngân)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded font-black text-[10px] uppercase rotate-[-6deg]">
                  ✓ ĐÃ THU TIỀN
                </span>
              </div>
              <p className="font-semibold text-slate-800">Thu ngân MediCare</p>
            </div>
          </div>

          {/* Footer dặn dò */}
          <div className="border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">
            Cảm ơn quý khách đã tin tưởng khám chữa bệnh tại Bệnh viện MediCare. Vui lòng giữ biên lai để đối chiếu khi cần thiết.
          </div>

        </div>

      </div>
    </div>
  );
};

export default PrintReceiptModal;

