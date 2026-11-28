import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  Settings,
  Shield,
  Bell,
  Info,
  Building2,
  Lock,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  Save,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const SettingsCard = ({ icon: Icon, title, children, accent = 'slate' }) => {
  const accentMap = {
    slate:  { header: 'bg-slate-900',  border: 'border-slate-200/80' },
    blue:   { header: 'bg-blue-600',   border: 'border-blue-100' },
    green:  { header: 'bg-teal-600',   border: 'border-teal-100' },
    purple: { header: 'bg-indigo-600', border: 'border-indigo-100' },
    gray:   { header: 'bg-slate-800',  border: 'border-slate-200/80' },
  };
  const s = accentMap[accent] || accentMap.slate;

  return (
    <div className={`bg-white rounded-3xl shadow-xs border ${s.border} overflow-hidden`}>
      <div className={`${s.header} text-white px-5 py-3.5 flex items-center gap-2.5`}>
        <Icon size={18} />
        <span className="font-bold text-sm">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-2.5">
    <div className="pr-4">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors shrink-0 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm font-medium text-gray-800 ${mono ? 'font-mono bg-gray-50 px-2 py-0.5 rounded text-xs' : ''}`}>
      {value}
    </span>
  </div>
);

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);

  // Runtime metadata
  const [systemMeta, setSystemMeta] = useState({
    activeQueueMode: 'PRIORITY',
    startupTime: '',
    javaVersion: '17+'
  });

  // Queue settings
  const [priorityMode, setPriorityMode] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);

  // Notification settings
  const [notifEmail, setNotifEmail] = useState('admin@medicare.vn');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [appointmentReminder, setAppointmentReminder] = useState(true);

  // Contact info
  const [contact, setContact] = useState({
    hospitalName: 'Bệnh viện Đa khoa Quốc tế MediCare',
    address: '123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3930 1234',
    email: 'contact@medicare.vn',
    bhytDefaultRate: '80'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings');
      const data = res?.data || res || {};
      applySettingsData(data);
    } catch (err) {
      toast.error(err?.message || 'Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const applySettingsData = (data) => {
    if (!data) return;
    setSystemMeta({
      activeQueueMode: data.activeQueueMode || data.queueMode || 'PRIORITY',
      startupTime: data.startupTime || 'Đang hoạt động',
      javaVersion: data.javaVersion || '17+'
    });
    setPriorityMode(String(data.priorityMode) !== 'false');
    setAutoAssign(String(data.autoAssign) !== 'false');
    if (data.notifEmail) setNotifEmail(data.notifEmail);
    setEmailNotif(String(data.emailNotif) !== 'false');
    setSmsNotif(String(data.smsNotif) === 'true');
    setAppointmentReminder(String(data.appointmentReminder) !== 'false');
    setContact({
      hospitalName: data.hospitalName || 'Bệnh viện Đa khoa Quốc tế MediCare',
      address: data.address || '123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
      phone: data.phone || '(028) 3930 1234',
      email: data.email || 'contact@medicare.vn',
      bhytDefaultRate: data.bhytDefaultRate || '80'
    });
  };

  const savePayload = async (section, payload, successMsg) => {
    setSavingSection(section);
    try {
      const res = await api.put('/api/settings', payload);
      const updated = res?.data || res;
      applySettingsData(updated);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi lưu cài đặt hệ thống');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveQueue = () => {
    savePayload(
      'queue',
      {
        priorityMode,
        queueMode: priorityMode ? 'PRIORITY' : 'FIFO',
        autoAssign
      },
      `Đã áp dụng chế độ hàng đợi ${priorityMode ? 'ƯU TIÊN ĐA TRỌNG SỐ (PRIORITY)' : 'TUẦN TỰ (FIFO)'}!`
    );
  };

  const handleSaveNotif = () => {
    savePayload(
      'notif',
      {
        notifEmail,
        emailNotif,
        smsNotif,
        appointmentReminder
      },
      'Đã lưu cài đặt thông báo vào cơ sở dữ liệu!'
    );
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    savePayload('contact', contact, 'Đã lưu thông tin bệnh viện & mức hưởng BHYT mặc định!');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xs">
            <Settings size={22} className="text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cài đặt Hệ thống</h1>
            <p className="text-sm text-slate-500">Quản trị tham số vận hành hàng đợi, thông báo và hồ sơ bệnh viện</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-2xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
          <span>Đồng bộ cấu hình</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── 1. Thông tin hệ thống ── */}
        <SettingsCard icon={Info} title="Thông tin Hệ thống Trực tuyến" accent="slate">
          <InfoRow label="Tên hệ thống" value="MediCare – Hospital Flow Platform" />
          <InfoRow label="Chế độ hàng đợi hiện hành" value={systemMeta.activeQueueMode} mono />
          <InfoRow label="Backend Runtime" value={`Spring Boot 3 · Java ${systemMeta.javaVersion}`} mono />
          <InfoRow label="Cơ sở dữ liệu" value="Microsoft SQL Server 2025 Express" mono />
          <InfoRow label="Thời điểm khởi chạy" value={systemMeta.startupTime || 'Đang hoạt động'} />
          <div className="mt-3 flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 font-medium">
              Kết nối cơ sở dữ liệu và WebSocket hàng đợi hoạt động ổn định
            </span>
          </div>
        </SettingsCard>

        {/* ── 2. Cấu hình hàng đợi ── */}
        <SettingsCard icon={Settings} title="Cấu hình Điều phối Hàng đợi" accent="blue">
          <div className="divide-y divide-gray-50">
            <Toggle
              enabled={priorityMode}
              onChange={setPriorityMode}
              label="Chế độ ưu tiên lâm sàng (PRIORITY / FIFO)"
              description="Tự động tính điểm ưu tiên theo cấp độ phân loại (Triage), người cao tuổi, bệnh nhân có kết quả CLS và thời gian chờ"
            />
            <Toggle
              enabled={autoAssign}
              onChange={setAutoAssign}
              label="Tự động cân bằng tải bác sĩ"
              description="Khi tiếp nhận bệnh nhân vãng lai, tự động phân bổ vào bác sĩ có ít ca chờ nhất trong chuyên khoa"
            />
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>Trạng thái đang chạy:</strong>{' '}
            <span className="font-mono font-bold">{systemMeta.activeQueueMode}</span> — Thay đổi có hiệu lực tức thì cho toàn bộ phòng khám.
          </div>
          <button
            type="button"
            disabled={savingSection === 'queue'}
            onClick={handleSaveQueue}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
          >
            <Save size={15} />
            {savingSection === 'queue' ? 'Đang áp dụng...' : 'Lưu & Áp dụng cấu hình hàng đợi'}
          </button>
        </SettingsCard>

        {/* ── 3. Thông báo ── */}
        <SettingsCard icon={Bell} title="Cài đặt Thông báo" accent="green">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email quản trị nhận cảnh báo</label>
            <input
              type="email"
              value={notifEmail}
              onChange={(e) => setNotifEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div className="divide-y divide-gray-50">
            <Toggle
              enabled={emailNotif}
              onChange={setEmailNotif}
              label="Thông báo qua Email"
              description="Gửi xác nhận lịch hẹn và thông báo kết quả cận lâm sàng"
            />
            <Toggle
              enabled={smsNotif}
              onChange={setSmsNotif}
              label="Thông báo qua SMS"
              description="Gửi tin nhắn nhắc lịch tái khám định kỳ"
            />
            <Toggle
              enabled={appointmentReminder}
              onChange={setAppointmentReminder}
              label="Nhắc nhở lịch hẹn tự động"
              description="Tự động gửi lời nhắc trước 24 giờ cho bệnh nhân"
            />
          </div>
          <button
            type="button"
            disabled={savingSection === 'notif'}
            onClick={handleSaveNotif}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
          >
            <Save size={15} />
            {savingSection === 'notif' ? 'Đang lưu...' : 'Lưu cài đặt thông báo'}
          </button>
        </SettingsCard>

        {/* ── 4. Bảo mật ── */}
        <SettingsCard icon={Shield} title="Cài đặt Bảo mật & Phân quyền" accent="purple">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
              <KeyRound size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Xác thực JWT & Phân quyền RBAC</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Phân tách nghiêm ngặt 5 vai trò: <strong>ADMIN, DOCTOR, STAFF, LAB_TECHNICIAN, PATIENT</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
              <Lock size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Bảo vệ Dữ liệu Lâm sàng & Dược</p>
                <ul className="text-xs text-gray-500 mt-1 space-y-0.5 list-disc list-inside">
                  <li>Mã hóa mật khẩu một chiều chuẩn BCrypt</li>
                  <li>Kiểm tra định dạng và giới hạn dung lượng tệp cận lâm sàng (10MB)</li>
                  <li>Khóa chống xuất trùng đơn thuốc (FEFO Idempotency)</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-700">
                Khóa bí mật JWT chỉ được phép thay đổi trực tiếp thông qua biến môi trường máy chủ.
              </p>
            </div>
          </div>
        </SettingsCard>

        {/* ── 5. Thông tin liên hệ (full width) ── */}
        <div className="lg:col-span-2">
          <SettingsCard icon={Building2} title="Thông tin Đơn vị Y tế & Tham số Viện phí" accent="gray">
            <form onSubmit={handleSaveContact}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Building2 size={13} /> Tên bệnh viện hiển thị trên phôi in
                  </label>
                  <input
                    type="text"
                    value={contact.hospitalName}
                    onChange={e => setContact(c => ({ ...c, hospitalName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức hưởng BHYT mặc định (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={contact.bhytDefaultRate}
                    onChange={e => setContact(c => ({ ...c, bhytDefaultRate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin size={13} /> Địa chỉ cơ sở
                  </label>
                  <input
                    type="text"
                    value={contact.address}
                    onChange={e => setContact(c => ({ ...c, address: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Phone size={13} /> Tổng đài liên hệ
                  </label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Mail size={13} /> Email chính thức
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSection === 'contact'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  <Save size={15} />
                  {savingSection === 'contact' ? 'Đang lưu...' : 'Lưu thông tin đơn vị'}
                </button>
              </div>
            </form>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
