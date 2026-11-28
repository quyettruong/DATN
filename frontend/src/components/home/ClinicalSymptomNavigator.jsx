import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Sparkles, 
  Search, 
  Stethoscope, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  HeartPulse, 
  Activity, 
  Clock, 
  Eye, 
  Smile, 
  Brain, 
  ShieldCheck, 
  Zap,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

const SYMPTOM_DATABASE = [
  {
    keywords: ['đau đầu', 'chóng mặt', 'hoa mắt', 'mất ngủ', 'tiền đình', 'nửa đầu', 'co giật', 'mệt mỏi'],
    category: 'Thần kinh & Nội khoa',
    deptId: 1,
    deptCode: 'NOI',
    deptName: 'Khoa Nội Tổng Quát',
    roomCode: 'R101 - R102',
    urgency: 'MEDIUM',
    urgencyText: 'Nên khám trong 24h - 48h',
    urgencyColor: 'bg-amber-100 text-amber-800 border-amber-200',
    possibleConditions: ['Rối loạn tiền đình', 'Căng thẳng đau đầu căng cơ', 'Thiếu máu não thoáng qua'],
    recommendedDoctor: 'BS. CKI Trần Văn Nam',
    advice: 'Nghỉ ngơi nơi yên tĩnh, hạn chế nhìn màn hình điện thoại/máy tính, đo huyết áp nếu có máy tại nhà.'
  },
  {
    keywords: ['tức ngực', 'khó thở', 'đau ngực', 'hồi hộp', 'tim đập nhanh', 'huyết áp', 'nặng ngực'],
    category: 'Tim Mạch & Hô Hấp',
    deptId: 1,
    deptCode: 'NOI',
    deptName: 'Khoa Nội Tổng Quát (Chuyên Khoa Tim Mạch)',
    roomCode: 'R102',
    urgency: 'HIGH',
    urgencyText: 'Cần khám sớm hoặc Cấp cứu nếu khó thở nặng',
    urgencyColor: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse',
    possibleConditions: ['Cơn tăng huyết áp', 'Rối loạn nhịp tim', 'Bệnh mạch vành / Co thắt phế quản'],
    recommendedDoctor: 'BS. CKI Trần Văn Nam',
    advice: 'Ngồi nghỉ tư thế nửa nằm nửa ngồi, nới lỏng cổ áo. Nếu cơn đau lan ra vai trái hoặc kèm vã mồ hôi, cần đến cấp cứu ngay.'
  },
  {
    keywords: ['sốt', 'ho', 'đờm', 'rát họng', 'đau họng', 'nghẹt mũi', 'sổ mũi', 'viêm xoang', 'ù tai', 'mất tiếng'],
    category: 'Tai Mũi Họng & Hô Hấp',
    deptId: 3,
    deptCode: 'TMH',
    deptName: 'Khoa Tai Mũi Họng',
    roomCode: 'R301 - R302',
    urgency: 'LOW',
    urgencyText: 'Khám theo hẹn thông thường',
    urgencyColor: 'bg-blue-100 text-blue-800 border-blue-200',
    possibleConditions: ['Viêm họng cấp', 'Cảm cúm thông thường', 'Viêm amidan / Viêm xoang cấp'],
    recommendedDoctor: 'BS. CKII Lê Hoàng Minh',
    advice: 'Uống nhiều nước ấm, súc họng bằng nước muối sinh lý 0.9%, không tự ý uống kháng sinh khi chưa có chỉ định.'
  },
  {
    keywords: ['răng', 'nướu', 'lợi', 'nhức răng', 'sâu răng', 'răng khôn', 'chảy máu chân răng', 'niềng răng', 'viêm nướu'],
    category: 'Răng Hàm Mặt',
    deptId: 4,
    deptCode: 'RHM',
    deptName: 'Khoa Răng Hàm Mặt',
    roomCode: 'R401 - R402',
    urgency: 'LOW',
    urgencyText: 'Khám theo hẹn thông thường',
    urgencyColor: 'bg-teal-100 text-teal-800 border-teal-200',
    possibleConditions: ['Sâu răng ăn vào tủy', 'Viêm lợi / Viêm quanh cuống', 'Mọc răng khôn lệch'],
    recommendedDoctor: 'BS. Nguyễn Bảo Anh',
    advice: 'Tránh ăn đồ quá nóng hoặc quá lạnh, súc miệng nước sát khuẩn sau ăn, không dùng tăm xỉa vào vùng viêm.'
  },
  {
    keywords: ['mắt', 'mờ', 'ngứa mắt', 'đỏ mắt', 'cộm', 'chảy nước mắt', 'cận thị', 'khô mắt', 'viêm kết mạc'],
    category: 'Chuyên Khoa Mắt',
    deptId: 5,
    deptCode: 'MAT',
    deptName: 'Khoa Mắt (Nhãn Khoa)',
    roomCode: 'R501 - R502',
    urgency: 'LOW',
    urgencyText: 'Khám theo hẹn thông thường',
    urgencyColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    possibleConditions: ['Viêm kết mạc (đau mắt đỏ)', 'Hội chứng khô mắt kỹ thuật số', 'Tật khúc xạ'],
    recommendedDoctor: 'ThS. BS. Phạm Thanh Hà',
    advice: 'Không dụi tay lên mắt, có thể nhỏ nước muối sinh lý hoặc dung dịch dưỡng mắt y tế, đeo kính râm bảo vệ mắt khi đi ra ngoài.'
  },
  {
    keywords: ['ngứa', 'mẩn đỏ', 'dị ứng', 'nổi mề đay', 'mụn', 'nấm', 'da liễu', 'vảy nến', 'viêm da'],
    category: 'Da Liễu & Thẩm Mỹ Y Khoa',
    deptId: 6,
    deptCode: 'DA',
    deptName: 'Khoa Da Liễu',
    roomCode: 'R601 - R602',
    urgency: 'LOW',
    urgencyText: 'Khám theo hẹn thông thường',
    urgencyColor: 'bg-purple-100 text-purple-800 border-purple-200',
    possibleConditions: ['Viêm da cơ địa / Dị ứng tiếp xúc', 'Mề đay cấp tính', 'Mụn trứng cá nhiễm khuẩn'],
    recommendedDoctor: 'BS. CKI Đỗ Thu Hằng',
    advice: 'Tạm ngưng mỹ phẩm và các chất tẩy rửa mạnh, không gãi trầy xước da, uống nhiều nước mát.'
  },
  {
    keywords: ['đau khớp', 'chấn thương', 'gãy xương', 'trật khớp', 'bong gân', 'thoát vị', 'đau lưng', 'khớp gối'],
    category: 'Ngoại Khoa & Chấn Thương',
    deptId: 2,
    deptCode: 'NGOAI',
    deptName: 'Khoa Ngoại & Chấn Thương Chỉnh Hình',
    roomCode: 'R201 - R202',
    urgency: 'MEDIUM',
    urgencyText: 'Nên khám sớm chuyên khoa cơ xương khớp',
    urgencyColor: 'bg-amber-100 text-amber-800 border-amber-200',
    possibleConditions: ['Bong gân giãn dây chằng', 'Thoái hóa khớp', 'Tổn thương sụn chêm / Viêm gân'],
    recommendedDoctor: 'BS. CKII Đặng Minh Tuấn',
    advice: 'Hạn chế vận động mạnh ở chi bị đau, có thể chườm đá lạnh giảm phù nề trong 48h đầu sau chấn thương.'
  },
  {
    keywords: ['dạ dày', 'ợ chua', 'đau bụng', 'trào ngược', 'tiêu chảy', 'buồn nôn', 'khó tiêu', 'táo bón'],
    category: 'Tiêu Hóa & Gan Mật',
    deptId: 1,
    deptCode: 'NOI',
    deptName: 'Khoa Nội Tổng Quát (Chuyên Tiêu Hóa)',
    roomCode: 'R101',
    urgency: 'LOW',
    urgencyText: 'Khám theo hẹn thông thường',
    urgencyColor: 'bg-blue-100 text-blue-800 border-blue-200',
    possibleConditions: ['Viêm loét dạ dày tá tràng', 'Trào ngược dạ dày thực quản (GERD)', 'Rối loạn tiêu hóa'],
    recommendedDoctor: 'BS. CKI Trần Văn Nam',
    advice: 'Ăn chín uống sôi, chia nhỏ bữa ăn, tránh đồ cay chua, rượu bia, không nằm ngay sau khi ăn no.'
  }
];

const POPULAR_QUICK_CHIPS = [
  'Sốt 39°C, ho đờm, rát họng',
  'Tức ngực, hồi hộp, khó thở',
  'Đau nửa đầu, chóng mặt khi đứng',
  'Đau nhức răng hàm, sưng lợi',
  'Mờ mắt, cộm ngứa, mỏi mắt',
  'Mẩn ngứa da, nổi mề đay',
  'Đau nhức khớp gối khi đi lại',
  'Đau thượng vị dạ dày, ợ chua'
];

const ClinicalSymptomNavigator = () => {
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeSymptom = async (text) => {
    if (!text || !text.trim()) return;
    setAnalyzing(true);
    setResult(null);

    const DEPT_CODE_TO_ID = { NOI: 1, NGOAI: 2, TMH: 3, RHM: 4, MAT: 5, DA: 6 };
    const DEPT_DOCTOR = {
      NOI: 'BS. Nguyễn Văn An',
      NGOAI: 'BS. Trần Thị Bình',
      TMH: 'BS. Lê Hoàng Cường',
      RHM: 'BS. Phạm Minh Đức',
      MAT: 'BS. Võ Minh Khôi',
      DA: 'BS. Đặng Thu Thảo',
    };

    try {
      const apiRes = await api.post('/api/ai/predict/symptom', { symptomText: text });
      const ai = apiRes?.data || apiRes;
      if (ai && ai.recommended_department_code) {
        const deptCode = ai.recommended_department_code;
        const urgencyColor =
          ai.urgency_level === 'HIGH'
            ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
            : ai.urgency_level === 'MEDIUM'
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-blue-100 text-blue-800 border-blue-200';
        const topPreds = (ai.top_predictions || []).map(
          (p) => `${p.disease_vi || p.disease_en} (${Math.round((p.probability || 0) * 100)}%)`
        );
        setResult({
          category:
            ai.aiSource === 'KAGGLE_PYTHON_AI'
              ? `Mô hình AI Kaggle · ${ai.model_name || 'ML Classifier'}`
              : 'Định hướng lâm sàng MediCare',
          deptId: DEPT_CODE_TO_ID[deptCode] || 1,
          deptCode,
          deptName: ai.recommended_department_name || 'Khoa Nội Tổng Quát',
          roomCode: ai.recommended_room_hint || 'R101 - R102',
          urgencyColor,
          urgencyText: ai.urgency_text || 'Khám chuyên khoa theo hẹn',
          possibleConditions:
            topPreds.length > 0 ? topPreds : ['Cần bác sĩ lâm sàng thăm khám trực tiếp'],
          recommendedDoctor: DEPT_DOCTOR[deptCode] || 'BS. Nguyễn Văn An',
          advice: Array.isArray(ai.precautions)
            ? ai.precautions.join(' · ')
            : 'Bạn nên đặt lịch khám sớm để bác sĩ kiểm tra trực tiếp.',
          matchedSymptoms: ai.matched_symptoms || [],
          aiSource: ai.aiSource,
        });
        setAnalyzing(false);
        return;
      }
    } catch (err) {
      console.warn('Fallback sang từ điển nội bộ:', err?.message);
    }

    setTimeout(() => {
      const lower = text.toLowerCase();
      let bestMatch = null;
      let maxScore = 0;

      for (const item of SYMPTOM_DATABASE) {
        let score = 0;
        for (const kw of item.keywords) {
          if (lower.includes(kw)) {
            score += 2;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
        }
      }

      if (!bestMatch) {
        bestMatch = {
          keywords: ['tổng quát'],
          category: 'Khám Đa Khoa & Tư Vấn Lâm Sàng',
          deptId: 1,
          deptCode: 'NOI',
          deptName: 'Khoa Nội Tổng Quát (Khám Ban Đầu)',
          roomCode: 'R101',
          urgency: 'LOW',
          urgencyText: 'Khám sàng lọc tổng quát',
          urgencyColor: 'bg-blue-100 text-blue-800 border-blue-200',
          possibleConditions: ['Cần bác sĩ lâm sàng thăm khám trực tiếp để xác định chuyên khoa'],
          recommendedDoctor: 'BS. Nguyễn Văn An',
          advice: 'Bạn nên đến khám tại Phòng Nội Tổng Quát để bác sĩ làm các xét nghiệm sàng lọc bước đầu.'
        };
      }

      setResult(bestMatch);
      setAnalyzing(false);
    }, 300);
  };

  const handleChipClick = (chipText) => {
    setInputQuery(chipText);
    analyzeSymptom(chipText);
  };

  const handleBookNow = (deptId) => {
    navigate(`/patient/appointments?deptId=${deptId}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header Title */}
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-full text-cyan-300 text-xs font-bold shadow-inner">
              <Activity className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>MediCare Clinical Navigator · Định Hướng Tiếp Nhận Khám Chuyên Khoa</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Bạn Đang Cảm Thấy Khó Chịu? Tra Cứu & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400">Gợi Ý Chuyên Khoa</span> Phù Hợp
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mô tả triệu chứng của bạn để hệ thống định hướng ngay chuyên khoa tiếp nhận, số phòng khám tương ứng và bác sĩ phụ trách.
            </p>
          </div>

          {/* Interactive Search Box */}
          <div className="space-y-3">
            <form 
              onSubmit={(e) => { e.preventDefault(); analyzeSymptom(inputQuery); }}
              className="flex flex-col sm:flex-row gap-2.5 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-inner"
            >
              <div className="flex-1 flex items-center px-4 space-x-3">
                <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Mô tả triệu chứng (VD: sốt cao 39 độ, ho khan kèm rát họng, đau nhức thái dương...)"
                  className="w-full bg-transparent text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing || !inputQuery.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {analyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Đang Phân Tích Triệu Chứng...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>Phân Luồng Ngay</span>
                  </>
                )}
              </button>
            </form>

            {/* Chips gợi ý nhanh */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                Gợi ý triệu chứng phổ biến:
              </span>
              {POPULAR_QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full text-[11px] font-medium border border-slate-700 transition-all hover:border-cyan-400/50 shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Result Card */}
          {result && (
            <div className="mt-6 bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-[10px] font-black uppercase rounded-bl-2xl">
                ✓ Định hướng chuyên khoa đề xuất
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Cột trái: Kết quả phân luồng */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                      {result.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.urgencyColor}`}>
                      {result.urgencyText}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuyên Khoa Tiếp Nhận Đề Xuất</p>
                    <h3 className="text-2xl font-black text-cyan-300 mt-1">
                      {result.deptName}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Phòng khám phụ trách: <strong className="text-white">{result.roomCode}</strong>
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-slate-400 font-bold">Các bệnh lý khả dĩ có thể liên quan:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.possibleConditions.map((cond, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-800 rounded-xl text-slate-200 border border-slate-700">
                          • {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-cyan-400" />
                      <span>Lời khuyên xử trí bước đầu:</span>
                    </p>
                    <p className="leading-relaxed text-slate-300">{result.advice}</p>
                  </div>
                </div>

                {/* Cột phải: Bác sĩ & Nút Đặt Khám */}
                <div className="lg:col-span-5 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Bác sĩ chuyên khoa tiêu biểu
                    </span>
                    <h4 className="text-base font-black text-white mt-1">
                      {result.recommendedDoctor}
                    </h4>
                    <p className="text-xs text-cyan-400 font-semibold">Chuyên gia phụ trách ca khám</p>
                    <div className="mt-2 flex items-center space-x-1 text-amber-400 text-xs font-bold">
                      <span>⭐⭐⭐⭐⭐</span>
                      <span className="text-slate-400 font-normal ml-1">4.9/5 · 1.200+ lượt khám</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleBookNow(result.deptId)}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Đặt Khám Chuyên Khoa Này Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      * Kết quả định hướng mang tính chất tham khảo ban đầu, không thay thế chẩn đoán chuyên sâu từ bác sĩ.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ClinicalSymptomNavigator;

