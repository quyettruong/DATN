import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Play,
  CheckCircle,
  Search,
  Beaker,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  X,
  RefreshCw
} from 'lucide-react';

const LabOrdersPage = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/processing')) return 'IN_PROGRESS';
    if (location.pathname.includes('/results') || location.pathname.includes('/history')) return 'COMPLETED';
    return 'ORDERED';
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/processing')) setActiveTab('IN_PROGRESS');
    else if (location.pathname.includes('/results') || location.pathname.includes('/history')) setActiveTab('COMPLETED');
    else setActiveTab('ORDERED');
  }, [location.pathname]);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [resultForm, setResultForm] = useState({
    resultValue: '',
    resultText: '',
    isAbnormal: false,
    notes: '',
    attachmentUrl: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/lab-orders');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setOrders(list);
    } catch (error) {
      toast.error('Lỗi tải danh sách chỉ định cận lâm sàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchTab = o.status === activeTab;
    const kw = searchTerm.trim().toLowerCase();
    const matchSearch =
      !kw ||
      o.patientName?.toLowerCase().includes(kw) ||
      o.patientCode?.toLowerCase().includes(kw) ||
      o.testName?.toLowerCase().includes(kw) ||
      o.doctorName?.toLowerCase().includes(kw);
    return matchTab && matchSearch;
  });

  const handleStartProcessing = async (id) => {
    try {
      await api.post(`/api/lab-orders/${id}/start`);
      toast.success('Đã nhận mẫu, bắt đầu xử lý');
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'IN_PROGRESS' } : o));
      setActiveTab('IN_PROGRESS');
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi nhận mẫu');
    }
  };

  const handleOpenResultModal = (order) => {
    setSelectedOrder(order);
    setResultForm({
      resultValue: order.resultValue || '',
      resultText: order.resultText || '',
      isAbnormal: Boolean(order.isAbnormal),
      notes: order.notes || '',
      attachmentUrl: order.attachmentUrl || ''
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingFile(true);
    try {
      const res = await api.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const payload = res?.data || res;
      if (payload?.url) {
        setResultForm(prev => ({ ...prev, attachmentUrl: payload.url }));
        toast.success('Đã tải lên hình ảnh / tài liệu kết quả!');
      }
    } catch (err) {
      toast.error(err?.message || 'Tải tệp đính kèm thất bại');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/lab-orders/${selectedOrder.id}/result`, resultForm);
      const updated = res?.data || res;
      toast.success('Đã lưu kết quả xét nghiệm / chẩn đoán hình ảnh thành công');
      setOrders(orders.map(o => o.id === selectedOrder.id ? (updated || { ...o, status: 'COMPLETED', ...resultForm }) : o));
      setSelectedOrder(null);
      setActiveTab('COMPLETED');
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi lưu kết quả');
    }
  };

  const isPdf = (url) => url?.toLowerCase().endsWith('.pdf');

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Beaker className="text-blue-600" /> Quản lý Xét nghiệm & Chẩn đoán Hình ảnh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tiếp nhận mẫu, cập nhật chỉ số sinh hóa và đính kèm phim chụp X-Quang / Siêu âm
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bệnh nhân, mã BN, tên XN..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          </div>
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        {['ORDERED', 'IN_PROGRESS', 'COMPLETED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab === 'ORDERED' ? 'Chờ xử lý' : tab === 'IN_PROGRESS' ? 'Đang thực hiện' : 'Đã trả kết quả'}
            <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
              {orders.filter(o => o.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bệnh nhân</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Chỉ định CLS</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bác sĩ CĐ</th>
              {activeTab === 'COMPLETED' && (
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kết quả & Tệp</th>
              )}
              <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                    {order.orderedAt ? dayjs(order.orderedAt).format('HH:mm DD/MM/YYYY') : '-'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{order.patientName}</div>
                    {order.patientCode && <div className="text-[11px] font-mono text-slate-400">#{order.patientCode}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-slate-900 font-semibold">{order.testName}</div>
                    <div className="text-[11px] text-slate-400">
                      Mã: {order.testCode} {order.normalRange ? `· Tham chiếu: ${order.normalRange}` : ''}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                    {order.doctorName}
                  </td>
                  {activeTab === 'COMPLETED' && (
                    <td className="px-5 py-4 text-xs">
                      <div className="font-bold text-blue-700 flex items-center gap-1.5">
                        <span>{order.resultValue || order.result || 'Đã cập nhật'}</span>
                        {order.isAbnormal && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-black">
                            BẤT THƯỜNG
                          </span>
                        )}
                      </div>
                      {/* [Tạm thời comment chức năng xem ảnh / phim chụp X-quang]
                      {order.attachmentUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(order)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200"
                        >
                          <ImageIcon size={12} /> Xem ảnh / Phim chụp
                        </button>
                      )} */}
                    </td>
                  )}
                  <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-bold">
                    {activeTab === 'ORDERED' && (
                      <button
                        onClick={() => handleStartProcessing(order.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Play size={14} /> Nhận mẫu
                      </button>
                    )}
                    {activeTab === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleOpenResultModal(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <FileText size={14} /> Nhập KQ & Ảnh
                      </button>
                    )}
                    {activeTab === 'COMPLETED' && (
                      <div className="inline-flex items-center gap-2">
                        <span className="text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle size={15} /> Đã trả KQ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenResultModal(order)}
                          className="text-slate-500 hover:text-blue-600 underline text-[11px]"
                        >
                          Sửa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTab === 'COMPLETED' ? 6 : 5} className="px-6 py-12 text-center text-slate-400 text-sm">
                  Không có chỉ định nào trong danh sách này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Result & Diagnostic Image Upload Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-base font-black">Cập Nhật Kết Quả & Ảnh Chẩn Đoán</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitResult}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100 space-y-1">
                  <div className="text-blue-900">
                    <span className="font-bold">Bệnh nhân:</span> {selectedOrder.patientName}{' '}
                    {selectedOrder.patientCode && <span className="font-mono">({selectedOrder.patientCode})</span>}
                  </div>
                  <div className="text-blue-900">
                    <span className="font-bold">Chỉ định:</span> {selectedOrder.testName}
                  </div>
                  {selectedOrder.normalRange && (
                    <div className="text-blue-700 text-[11px]">
                      <span className="font-semibold">Khoảng tham chiếu:</span> {selectedOrder.normalRange}{' '}
                      {selectedOrder.unit ? `(${selectedOrder.unit})` : ''}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giá trị kết quả / Kết luận ngắn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    value={resultForm.resultValue}
                    onChange={e => setResultForm({ ...resultForm, resultValue: e.target.value })}
                    placeholder={selectedOrder.category === 'IMAGING' ? 'VD: Tim phổi bình thường / Gan nhiễm mỡ độ 1' : 'VD: 5.4 mmol/L'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết cận lâm sàng</label>
                  <textarea
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                    value={resultForm.resultText}
                    onChange={e => setResultForm({ ...resultForm, resultText: e.target.value })}
                    placeholder="Mô tả chi tiết hình ảnh siêu âm, X-quang hoặc các chỉ số phụ..."
                  />
                </div>

                {/* [Tạm thời comment phần Upload ảnh X-quang / Siêu âm / PDF]
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Đính kèm ảnh chụp X-Quang / Siêu âm / Phiếu PDF (Tối đa 10MB)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors border border-slate-200">
                      <Upload size={15} />
                      <span>{uploadingFile ? 'Đang tải tệp...' : 'Chọn ảnh / PDF'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                    {resultForm.attachmentUrl && (
                      <button
                        type="button"
                        onClick={() => setResultForm({ ...resultForm, attachmentUrl: '' })}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        Xóa tệp đính kèm
                      </button>
                    )}
                  </div>

                  {resultForm.attachmentUrl && (
                    <div className="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      {isPdf(resultForm.attachmentUrl) ? (
                        <a
                          href={resultForm.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline"
                        >
                          <FileText size={16} /> Xem tài liệu PDF đã tải lên <ExternalLink size={13} />
                        </a>
                      ) : (
                        <img
                          src={resultForm.attachmentUrl}
                          alt="Ảnh cận lâm sàng"
                          className="max-h-44 rounded-xl border border-slate-200 object-contain mx-auto"
                        />
                      )}
                    </div>
                  )}
                </div> */}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isAbnormal"
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    checked={resultForm.isAbnormal}
                    onChange={e => setResultForm({ ...resultForm, isAbnormal: e.target.checked })}
                  />
                  <label htmlFor="isAbnormal" className="font-bold text-rose-600 flex items-center gap-1 cursor-pointer">
                    <AlertCircle size={15} /> Đánh dấu chỉ số / hình ảnh bất thường cần lưu ý
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú kỹ thuật viên</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    value={resultForm.notes}
                    onChange={e => setResultForm({ ...resultForm, notes: e.target.value })}
                    placeholder="Ghi chú thêm cho bác sĩ điều trị (nếu có)..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black disabled:opacity-50"
                >
                  Lưu & Gửi Kết Quả Cho Bác Sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diagnostic Image Lightbox Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">{previewAttachment.testName} — {previewAttachment.patientName}</h3>
                <p className="text-xs text-slate-400">{previewAttachment.resultValue}</p>
              </div>
              <button onClick={() => setPreviewAttachment(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center max-h-[75vh] overflow-auto">
              {isPdf(previewAttachment.attachmentUrl) ? (
                <a
                  href={previewAttachment.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2"
                >
                  <FileText size={16} /> Mở tệp PDF kết quả trong tab mới <ExternalLink size={14} />
                </a>
              ) : (
                <img
                  src={previewAttachment.attachmentUrl}
                  alt={previewAttachment.testName}
                  className="max-h-[65vh] object-contain rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabOrdersPage;
