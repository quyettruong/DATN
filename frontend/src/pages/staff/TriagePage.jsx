import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Activity, Save, User, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TriagePage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [vitals, setVitals] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    spO2: '',
    triageLevel: ''
  });
  const [loading, setLoading] = useState(false);

  const [fetchingList, setFetchingList] = useState(false);

  useEffect(() => {
    fetchPendingPatients();
  }, []);

  const fetchPendingPatients = async () => {
    setFetchingList(true);
    try {
      const res = await api.get('/api/triage/pending');
      const data = res?.data || res || [];
      if (Array.isArray(data) && data.length > 0) {
        setPatients(data.map(p => ({
          id: p.id,
          checkInId: p.id,
          patientCode: p.patientCode || `BN${String(p.id).padStart(3, '0')}`,
          name: p.patientName || 'Bệnh nhân',
          queueNumber: p.queueNumber,
          reason: 'Đã check-in chờ đo sinh hiệu',
          status: 'WAITING_TRIAGE'
        })));
      } else {
        setPatients([]);
      }
    } catch (e) {
      console.error('Lỗi tải danh sách phân loại:', e);
    } finally {
      setFetchingList(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setVitals({
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      spO2: '',
      triageLevel: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  const suggestTriage = async () => {
    try {
      const res = await api.post('/api/triage/suggest', {
        bloodPressureSystolic: vitals.bloodPressureSystolic ? Number(vitals.bloodPressureSystolic) : null,
        bloodPressureDiastolic: vitals.bloodPressureDiastolic ? Number(vitals.bloodPressureDiastolic) : null,
        heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
        temperature: vitals.temperature ? Number(vitals.temperature) : null,
        spO2: vitals.spO2 ? Number(vitals.spO2) : null
      });

      const level = res?.data || res;
      if (level && typeof level === 'string') {
        setVitals(prev => ({ ...prev, triageLevel: level }));
        toast.success(`Hệ thống gợi ý mức độ: ${level}`);
      } else {
        // Fallback rule
        let fallback = 'LEVEL_4_SEMI_URGENT';
        if (Number(vitals.temperature) > 39 || (vitals.spO2 && Number(vitals.spO2) < 92)) fallback = 'LEVEL_2_EMERGENCY';
        else if (Number(vitals.temperature) > 38) fallback = 'LEVEL_3_URGENT';
        setVitals(prev => ({ ...prev, triageLevel: fallback }));
        toast.success(`Gợi ý lâm sàng: ${fallback}`);
      }
    } catch (err) {
      let fallback = 'LEVEL_4_SEMI_URGENT';
      if (Number(vitals.temperature) > 39 || (vitals.spO2 && Number(vitals.spO2) < 92)) fallback = 'LEVEL_2_EMERGENCY';
      else if (Number(vitals.temperature) > 38) fallback = 'LEVEL_3_URGENT';
      setVitals(prev => ({ ...prev, triageLevel: fallback }));
      toast.success(`Gợi ý lâm sàng: ${fallback}`);
    }
  };

  const handleSubmit = async () => {
    if (!vitals.triageLevel) {
      toast.error('Vui lòng chọn hoặc nhận gợi ý mức độ ưu tiên');
      return;
    }
    
    setLoading(true);
    try {
      await api.post(`/api/triage/check-ins/${selectedPatient.checkInId}/triage`, {
        bloodPressureSystolic: vitals.bloodPressureSystolic ? Number(vitals.bloodPressureSystolic) : null,
        bloodPressureDiastolic: vitals.bloodPressureDiastolic ? Number(vitals.bloodPressureDiastolic) : null,
        heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
        temperature: vitals.temperature ? Number(vitals.temperature) : null,
        weight: vitals.weight ? Number(vitals.weight) : null,
        height: vitals.height ? Number(vitals.height) : null,
        spO2: vitals.spO2 ? Number(vitals.spO2) : null,
        triageLevel: vitals.triageLevel
      });
      toast.success('Đã lưu sinh hiệu & tái xếp hạng ưu tiên thành công');
      
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
      setSelectedPatient(null);
      await fetchPendingPatients();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Phân Loại Bệnh Nhân (Triage)</h1>
        <p className="text-gray-500 mt-1">Đo sinh hiệu và phân loại mức độ ưu tiên</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left column - Patient List */}
        <div className="w-full lg:w-1/3 bg-white rounded-3xl shadow-xs border border-slate-200/80 flex flex-col max-h-[420px] lg:max-h-[calc(100vh-12rem)]">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm BN, mã BN..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredPatients.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                Không có bệnh nhân chờ phân loại
              </div>
            ) : (
              filteredPatients.map(patient => (
                <div 
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedPatient?.id === patient.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'}`}
                >
                  <div className="font-bold text-gray-900">{patient.name}</div>
                  <div className="text-sm text-gray-500">{patient.patientCode}</div>
                  <div className="text-sm text-gray-700 mt-2 bg-white px-2 py-1 rounded border inline-block">Lý do: {patient.reason}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column - Triage Form */}
        <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-xs border border-slate-200/80 flex flex-col min-h-[420px] lg:max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
          {!selectedPatient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <Activity size={64} className="mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-500">Chọn bệnh nhân để nhập sinh hiệu</h3>
            </div>
          ) : (
            <div className="p-6 flex flex-col h-full">
              {/* Patient Header */}
              <div className="flex items-start justify-between bg-teal-50 p-4 rounded-lg border border-teal-100 mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-teal-700 text-sm font-medium">Mã BN: {selectedPatient.patientCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Lý do khám</p>
                  <p className="font-medium text-gray-900">{selectedPatient.reason}</p>
                </div>
              </div>

              {/* Vitals Form */}
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Chỉ số sinh hiệu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Huyết áp (mmHg)</label>
                  <div className="flex items-center space-x-2">
                    <input type="number" name="bloodPressureSystolic" value={vitals.bloodPressureSystolic} onChange={handleInputChange} placeholder="Tâm thu" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-teal-500 focus:border-teal-500" />
                    <span className="text-gray-500 text-xl">/</span>
                    <input type="number" name="bloodPressureDiastolic" value={vitals.bloodPressureDiastolic} onChange={handleInputChange} placeholder="Tâm trương" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-teal-500 focus:border-teal-500" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhịp tim (lần/phút)</label>
                  <input type="number" name="heartRate" value={vitals.heartRate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhiệt độ (°C)</label>
                  <input type="number" step="0.1" name="temperature" value={vitals.temperature} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
                  <input type="number" name="spO2" value={vitals.spO2} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-teal-500 focus:border-teal-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                  <input type="number" step="0.1" name="weight" value={vitals.weight} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-teal-500 focus:border-teal-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (cm)</label>
                  <input type="number" name="height" value={vitals.height} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-teal-500 focus:border-teal-500" />
                </div>
              </div>

              {/* Triage Level Selection */}
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-900">Mức độ ưu tiên</h3>
                <button 
                  onClick={suggestTriage}
                  className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 font-medium flex items-center"
                >
                  <Activity size={16} className="mr-1" /> Gợi ý tự động
                </button>
              </div>
              
              <div className="space-y-3 flex-1 mb-6">
                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${vitals.triageLevel === 'LEVEL_1_RESUSCITATION' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="triageLevel" value="LEVEL_1_RESUSCITATION" checked={vitals.triageLevel === 'LEVEL_1_RESUSCITATION'} onChange={handleInputChange} className="w-4 h-4 text-red-600" />
                  <div className="ml-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                    <span className="font-bold text-red-700 mr-2">Cấp cứu</span>
                    <span className="text-gray-500 text-sm">- Ngay lập tức</span>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${vitals.triageLevel === 'LEVEL_2_EMERGENCY' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="triageLevel" value="LEVEL_2_EMERGENCY" checked={vitals.triageLevel === 'LEVEL_2_EMERGENCY'} onChange={handleInputChange} className="w-4 h-4 text-orange-600" />
                  <div className="ml-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                    <span className="font-bold text-orange-600 mr-2">Khẩn cấp</span>
                    <span className="text-gray-500 text-sm">- &lt; 15 phút</span>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${vitals.triageLevel === 'LEVEL_3_URGENT' ? 'bg-yellow-50 border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="triageLevel" value="LEVEL_3_URGENT" checked={vitals.triageLevel === 'LEVEL_3_URGENT'} onChange={handleInputChange} className="w-4 h-4 text-yellow-600" />
                  <div className="ml-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                    <span className="font-bold text-yellow-600 mr-2">Cấp thiết</span>
                    <span className="text-gray-500 text-sm">- &lt; 30 phút</span>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${vitals.triageLevel === 'LEVEL_4_SEMI_URGENT' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="triageLevel" value="LEVEL_4_SEMI_URGENT" checked={vitals.triageLevel === 'LEVEL_4_SEMI_URGENT'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                  <div className="ml-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    <span className="font-bold text-blue-600 mr-2">Bình thường</span>
                    <span className="text-gray-500 text-sm">- Lịch hẹn</span>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${vitals.triageLevel === 'LEVEL_5_NON_URGENT' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="triageLevel" value="LEVEL_5_NON_URGENT" checked={vitals.triageLevel === 'LEVEL_5_NON_URGENT'} onChange={handleInputChange} className="w-4 h-4 text-green-600" />
                  <div className="ml-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="font-bold text-green-600 mr-2">Không khẩn</span>
                    <span className="text-gray-500 text-sm">- Khám định kỳ</span>
                  </div>
                </label>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t flex justify-end">
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} className="mr-2" />
                  {loading ? 'Đang lưu...' : 'Lưu thông tin sinh hiệu'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriagePage;

