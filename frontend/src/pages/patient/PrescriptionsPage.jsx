import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import dayjs from 'dayjs';
import { Pill, Printer, Calendar, User, FileText, Search } from 'lucide-react';
import PrintPrescriptionModal from '../../components/medical/PrintPrescriptionModal';

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/prescriptions/my');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setPrescriptions(list);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    !searchTerm ||
    p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.items?.some(i => i.medicationName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Pill className="text-teal-600" /> Đơn Thuốc Của Tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu lịch sử kê đơn, hướng dẫn sử dụng thuốc và in đơn thuốc điện tử
          </p>
        </div>
        
        {prescriptions.length > 0 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo tên thuốc, bác sĩ..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-teal-500 focus:ring-teal-500 w-64 shadow-2xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-3"></div>
          <p className="text-sm font-medium">Đang tải danh sách đơn thuốc...</p>
        </div>
      ) : filteredPrescriptions.length > 0 ? (
        <div className="space-y-6">
          {filteredPrescriptions.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden transition-all hover:border-teal-300">
              <div className="bg-gradient-to-r from-teal-50/80 to-blue-50/50 px-6 py-4 border-b border-teal-100 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      #RX-{p.id.toString().padStart(6, '0')}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <Calendar size={16} className="text-teal-600" /> {dayjs(p.prescribedAt).format('DD/MM/YYYY')}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Bác sĩ kê đơn: <strong className="text-slate-800">{p.doctorName || 'Bác sĩ phụ trách'}</strong></span>
                    {p.diagnosis && <span>Chẩn đoán: <strong className="text-teal-700">{p.diagnosis}</strong></span>}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPrescription(p)} 
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 rounded-xl text-xs font-bold border border-teal-200 shadow-2xs transition-colors"
                >
                  <Printer size={15} /> In / Xem Đơn Chuẩn
                </button>
              </div>
              <div className="p-6">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-2.5 text-left rounded-l-lg">STT</th>
                      <th className="px-4 py-2.5 text-left">Tên Dược Phẩm</th>
                      <th className="px-4 py-2.5 text-left">Liều Lượng</th>
                      <th className="px-4 py-2.5 text-center">Số Lượng</th>
                      <th className="px-4 py-2.5 text-left rounded-r-lg">Cách Dùng / Lời Dặn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {p.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{item.medicationName || item.medicationId}</td>
                        <td className="px-4 py-3 text-slate-600">{item.dosage}</td>
                        <td className="px-4 py-3 text-center font-bold text-teal-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-slate-500 italic">{item.instruction || 'Theo chỉ định của bác sĩ'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-12 text-center text-slate-500 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-4">
            <Pill size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {searchTerm ? 'Không tìm thấy đơn thuốc phù hợp' : 'Chưa có đơn thuốc nào'}
          </h3>
          <p className="text-xs text-slate-500">
            {searchTerm 
              ? 'Vui lòng thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc.'
              : 'Sau khi hoàn thành khám bệnh tại phòng khám, các đơn thuốc điện tử sẽ được lưu trữ tự động tại đây.'}
          </p>
        </div>
      )}

      {/* Modal in đơn thuốc */}
      {selectedPrescription && (
        <PrintPrescriptionModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
};

export default PrescriptionsPage;

