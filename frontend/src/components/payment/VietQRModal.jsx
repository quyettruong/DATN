import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  X, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Building2, 
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_BANK = {
  bankId: '970422', // MBBank BIN
  bankName: 'MBBank (Ngân Hàng TMCP Quân Đội)',
  accountNo: '0901234567',
  accountName: 'BỆNH VIỆN ĐA KHOA MEDICARE'
};

const VietQRModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount = 150000,
  memo = 'MEDICARE APPT',
  title = 'Thanh Toán Qua VietQR 24/7',
  subTitle = 'Quét mã bằng bất kỳ ứng dụng ngân hàng hoặc ví điện tử',
  bankInfo = DEFAULT_BANK
}) => {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [verifying, setVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(900);
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCurrency = (val) => Number(val || 0).toLocaleString('vi-VN') + ' đ';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPaid = () => {
    setVerifying(true);
    // Mô phỏng đối soát ngân hàng trong 1.2s
    setTimeout(() => {
      setVerifying(false);
      toast.success('Hệ thống đã ghi nhận thanh toán thành công!');
      if (onSuccess) onSuccess();
    }, 1200);
  };

  // URL VietQR NAPAS 247 chính thức
  const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-4 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <QrCode className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">{title}</h3>
              <p className="text-[11px] text-blue-100 mt-0.5">{subTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body scrollable */}
        <div className="p-6 overflow-y-auto space-y-4 text-center">
          
          {/* Đồng hồ đếm lùi */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-xs text-amber-800">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              Giao dịch tự động hết hạn sau:
            </span>
            <span className="font-mono font-black text-sm text-amber-700 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Khung chứa ảnh mã QR VietQR NAPAS */}
          <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 p-4 rounded-3xl border-2 border-dashed border-blue-300 inline-block shadow-inner relative group">
            <img
              src={qrUrl}
              alt="VietQR NAPAS 247"
              className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl mx-auto shadow-sm bg-white"
            />
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chuẩn chuyển khoản liên ngân hàng <strong>NAPAS 247</strong></span>
            </div>
          </div>

          {/* Hộp chi tiết chuyển khoản có nút Copy */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2.5">
            
            {/* Ngân hàng */}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-bold text-slate-800 text-right">{bankInfo.bankName}</span>
            </div>

            {/* Số tài khoản */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-blue-700 text-sm tracking-wider">{bankInfo.accountNo}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(bankInfo.accountNo, 'Số tài khoản')}
                  className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                  title="Sao chép STK"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Tên chủ tài khoản */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <span className="font-bold text-slate-900 uppercase">{bankInfo.accountName}</span>
            </div>

            {/* Số tiền */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Số tiền:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-rose-600 text-base">{formatCurrency(amount)}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(amount.toString(), 'Số tiền')}
                  className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                  title="Sao chép số tiền"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Nội dung */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Nội dung CK:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded text-xs select-all">
                  {memo}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(memo, 'Nội dung chuyển khoản')}
                  className="p-1 hover:bg-blue-200 rounded text-blue-700 transition-colors"
                  title="Sao chép nội dung"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* Hướng dẫn ngắn */}
          <div className="bg-blue-50/60 rounded-2xl p-3 text-[11px] text-slate-600 text-left space-y-1 border border-blue-100">
            <p className="font-bold text-blue-900 flex items-center gap-1">
              <Smartphone size={13} className="text-blue-600" /> Hướng dẫn quét mã:
            </p>
            <p>1. Mở App ngân hàng bất kỳ (Vietcombank, MB, Techcombank, VPBank, MoMo...)</p>
            <p>2. Chọn tính năng <strong>Quét QR</strong> và hướng camera vào mã ở trên</p>
            <p>3. Kiểm tra số tiền & bấm chuyển khoản. Sau khi chuyển xong, bấm nút xác nhận bên dưới.</p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-2xl text-xs transition-colors"
          >
            Đóng / Để sau
          </button>
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={verifying}
            className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang đối soát giao dịch...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Tôi Đã Chuyển Khoản Xong</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VietQRModal;
