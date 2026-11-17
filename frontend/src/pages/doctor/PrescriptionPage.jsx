import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import dayjs from 'dayjs';
import { Pill, Printer, Search, FileText, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PrintPrescriptionModal from '../../components/medical/PrintPrescriptionModal';

const PrescriptionPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedPrescForPrint, setSelectedPrescForPrint] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/prescriptions');
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setPrescriptions(data);
    } catch (error) {
      toast.error(error?.message || 'Lỗi tải danh sách đơn thuốc đã kê');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const kw = searchTerm.trim().toLowerCase();
    if (!kw) return true;
    const matchDrug = (p.items || []).some(it =>
      (it.medicationName || it.medication?.name || '').toLowerCase().includes(kw)
    );
    return (
      p.patientName?.toLowerCase().includes(kw) ||
      p.patientCode?.toLowerCase().includes(kw) ||
      p.diagnosis?.toLowerCase().includes(kw) ||
      matchDrug
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Pill className="text-teal-600" /> Quản lý Đơn thuốc Đã Kê
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tra cứu lịch sử đơn thuốc điện tử đã kê, trạng thái cấp phát tại quầy dược và in lại đơn
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bệnh nhân, chẩn đoán, tên thuốc..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          </div>
          <button
            type="button"
            onClick={fetchPrescriptions}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã & Ngày kê</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bệnh nhân</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Chẩn đoán</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Số loại thuốc</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái Dược</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm">
                  Đang tải danh sách đơn thuốc...
                </td>
              </tr>
            ) : filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map(p => (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="font-mono font-bold text-teal-700">#RX-{String(p.id).padStart(6, '0')}</div>
                      <div>{dayjs(p.prescribedAt || p.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{p.patientName || 'Bệnh nhân'}</div>
                      {p.patientCode && <div className="text-xs font-mono text-slate-400">#{p.patientCode}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 font-medium">{p.diagnosis || 'Chưa ghi nhận'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 py-1 px-2.5 rounded-full font-bold">
                        {p.items?.length || 0} loại thuốc
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                      {p.status === 'DISPENSED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={13} /> Đã phát thuốc
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                          <Clock size={13} /> Chờ phát thuốc
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        {expandedId === p.id ? 'Thu gọn' : 'Chi tiết'}
                      </button>
                      <button
                        onClick={() => setSelectedPrescForPrint(p)}
                        className="text-slate-600 hover:text-teal-700 inline-flex items-center"
                        title="In đơn thuốc"
                      >
                        <Printer size={17} />
                      </button>
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-xs font-black text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                          <FileText size={15} className="text-teal-600" /> Chi tiết danh mục thuốc kê đơn:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {p.items?.map((item, idx) => (
                            <div key={item.id || idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex gap-3">
                              <div className="bg-teal-50 border border-teal-200 rounded-xl h-9 w-9 flex items-center justify-center text-teal-700 font-black text-xs shrink-0">
                                {idx + 1}
                              </div>
                              <div className="text-xs space-y-0.5">
                                <div className="font-bold text-slate-900 text-sm">
                                  {item.medicationName || item.medication?.name || 'Dược phẩm'}
                                </div>
                                <div className="text-slate-600">
                                  <span className="font-semibold">Liều lượng:</span> {item.dosage}
                                  {item.frequency ? ` (${item.frequency})` : ''}
                                </div>
                                <div className="text-slate-600">
                                  <span className="font-semibold">Số lượng:</span> <strong>{item.quantity}</strong>
                                </div>
                                {item.instruction && (
                                  <div className="text-slate-500 italic pt-0.5">
                                    Hướng dẫn: {item.instruction}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm">
                  Chưa có đơn thuốc nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPrescForPrint && (
        <PrintPrescriptionModal
          prescription={selectedPrescForPrint}
          onClose={() => setSelectedPrescForPrint(null)}
        />
      )}
    </div>
  );
};

export default PrescriptionPage;
