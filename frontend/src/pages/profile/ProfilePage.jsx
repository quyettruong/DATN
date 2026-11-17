import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Calendar, MapPin, Lock, Save, Eye, EyeOff, Shield, AlertTriangle, Activity, Heart
} from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

const ROLE_CONFIG = {
  ADMIN: { label: 'Quản trị viên', color: 'bg-red-100 text-red-700 border-red-200', avatarBg: 'bg-red-500' },
  DOCTOR: { label: 'Bác sĩ', color: 'bg-blue-100 text-blue-700 border-blue-200', avatarBg: 'bg-blue-600' },
  STAFF: { label: 'Nhân viên', color: 'bg-teal-100 text-teal-700 border-teal-200', avatarBg: 'bg-teal-500' },
  PATIENT: { label: 'Bệnh nhân', color: 'bg-green-100 text-green-700 border-green-200', avatarBg: 'bg-green-500' },
  LAB_TECHNICIAN: { label: 'Kỹ thuật viên', color: 'bg-purple-100 text-purple-700 border-purple-200', avatarBg: 'bg-purple-500' },
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
    </div>
  );
};

const InputField = ({ label, icon: Icon, value, onChange, type = 'text', readOnly = false, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border rounded-lg text-sm transition-colors
          ${readOnly
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }`}
      />
    </div>
  </div>
);

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwVisible, setPwVisible] = useState({ old: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/me');
        const userData = res?.data || res;
        setProfile(userData);
        setForm(userData);
      } catch {
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('auth_user');
          if (stored) {
            const user = JSON.parse(stored);
            const fallback = { username: user.username, fullName: user.fullName, role: user.role, email: '', phone: '', dob: '', gender: '', address: '' };
            setProfile(fallback);
            setForm(fallback);
          }
        } catch {
          setProfile({});
          setForm({});
        }
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/users/me', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        address: form.address,
        allergies: form.allergies,
        medicalHistory: form.medicalHistory,
        bloodType: form.bloodType,
      });
      const updated = res?.data || res || { ...profile, ...form };
      const merged = { ...profile, ...form, ...updated };
      setProfile(merged);
      setEditing(false);

      // Đồng bộ ngược vào authStore & localStorage để Navbar / Thẻ sức khỏe cập nhật tức thì
      try {
        const currentStored = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const nextStored = {
          ...currentStored,
          fullName: merged.fullName || currentStored.fullName,
          email: merged.email || currentStored.email,
          phone: merged.phone || currentStored.phone,
          dob: merged.dob || currentStored.dob,
          bloodType: merged.bloodType || currentStored.bloodType,
          allergies: merged.allergies || currentStored.allergies,
          medicalHistory: merged.medicalHistory || currentStored.medicalHistory,
        };
        localStorage.setItem('auth_user', JSON.stringify(nextStored));
        useAuthStore.setState({ user: nextStored });
      } catch {}

      showToast('Cập nhật hồ sơ cá nhân thành công!');
    } catch (err) {
      showToast(err?.message || 'Không thể lưu thay đổi hồ sơ. Vui lòng kiểm tra lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profile);
    setEditing(false);
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pwForm.oldPassword) return setPwError('Vui lòng nhập mật khẩu cũ.');
    if (pwForm.newPassword.length < 6) return setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('Mật khẩu xác nhận không khớp.');
    setPwSaving(true);
    try {
      try {
        await api.post('/api/users/me/change-password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      } catch (e1) {
        await api.put('/api/users/me/password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      }
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Đổi mật khẩu thành công!');
    } catch (err) {
      setPwError(err?.message || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.');
    } finally {
      setPwSaving(false);
    }
  };

  const roleConf = ROLE_CONFIG[profile?.role] || ROLE_CONFIG['PATIENT'];
  const initials = (profile?.fullName || profile?.username || '?').charAt(0).toUpperCase();

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 flex items-center gap-5">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0 ${roleConf.avatarBg}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.fullName || profile.username || 'Người dùng'}</h1>
            <p className="text-gray-500 text-sm mt-0.5">@{profile.username || '---'}</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${roleConf.color}`}>
              <Shield size={12} />
              {roleConf.label}
            </span>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <User size={14} /> Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Tên đăng nhập" icon={User} value={profile.username} readOnly />
            <InputField
              label="Họ và tên"
              icon={User}
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              readOnly={!editing}
              placeholder="Nhập họ và tên"
            />
            <InputField
              label="Email"
              icon={Mail}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              readOnly={!editing}
              type="email"
              placeholder="example@email.com"
            />
            <InputField
              label="Số điện thoại"
              icon={Phone}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              readOnly={!editing}
              placeholder="0xxx xxx xxx"
            />
            <InputField
              label="Ngày sinh"
              icon={Calendar}
              value={form.dob}
              onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
              readOnly={!editing}
              type="date"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              {editing ? (
                <select
                  value={form.gender ?? ''}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn --</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              ) : (
                <input
                  readOnly
                  value={form.gender === 'MALE' ? 'Nam' : form.gender === 'FEMALE' ? 'Nữ' : form.gender === 'OTHER' ? 'Khác' : '---'}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <InputField
                label="Địa chỉ"
                icon={MapPin}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                readOnly={!editing}
                placeholder="Nhập địa chỉ"
              />
            </div>

            {/* Patient Clinical Profile & Allergies */}
            {profile.role === 'PATIENT' && (
              <>
                <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                    <Heart size={16} className="text-rose-500" />
                    Hồ sơ Y tế & Cảnh báo Dị ứng Dược phẩm
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm máu</label>
                  {editing ? (
                    <select
                      value={form.bloodType ?? ''}
                      onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chưa xác định --</option>
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  ) : (
                    <input
                      readOnly
                      value={form.bloodType || 'Chưa cập nhật'}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-semibold text-rose-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-red-500" />
                    Tiền sử Dị ứng (Thuốc, Thức ăn...)
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      placeholder="VD: Penicillin, Aspirin, Dị ứng hải sản..."
                      value={form.allergies ?? ''}
                      onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50/20"
                    />
                  ) : (
                    <input
                      readOnly
                      value={form.allergies || 'Không ghi nhận dị ứng'}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm cursor-not-allowed font-medium ${
                        form.allergies ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <Activity size={14} className="text-blue-500" />
                    Tiền sử Bệnh lý bản thân
                  </label>
                  {editing ? (
                    <textarea
                      rows={2}
                      placeholder="VD: Viêm loét dạ dày tá tràng mạn tính, Tăng huyết áp..."
                      value={form.medicalHistory ?? ''}
                      onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 cursor-not-allowed min-h-[42px]">
                      {form.medicalHistory || 'Chưa ghi nhận bệnh lý đặc biệt'}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Lock size={18} className="text-gray-600" /> Đổi mật khẩu
          </h2>
          <form onSubmit={handlePwSubmit} className="space-y-4 max-w-md">
            {[
              { key: 'old', field: 'oldPassword', label: 'Mật khẩu cũ' },
              { key: 'new', field: 'newPassword', label: 'Mật khẩu mới' },
              { key: 'confirm', field: 'confirmPassword', label: 'Xác nhận mật khẩu mới' },
            ].map(({ key, field, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={pwVisible[key] ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPwVisible(v => ({ ...v, [key]: !v[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {pwVisible[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            {pwError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}
            <button
              type="submit"
              disabled={pwSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              <Lock size={14} /> {pwSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
