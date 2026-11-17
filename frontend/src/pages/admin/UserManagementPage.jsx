import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Loader2,
  X,
  Lock,
  Unlock,
  ShieldAlert,
  Building2,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    password: '',
    email: '',
    phone: '',
    role: 'STAFF',
    departmentId: '',
    licenseNo: '',
    specialization: '',
    enabled: true
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setUsers(list);
    } catch (err) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/departments');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setDepartments(list);
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      username: '',
      fullName: '',
      password: '',
      email: '',
      phone: '',
      role: 'STAFF',
      departmentId: departments[0]?.id || '',
      licenseNo: '',
      specialization: '',
      enabled: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      fullName: user.fullName || '',
      password: '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      departmentId: '',
      licenseNo: '',
      specialization: '',
      enabled: user.enabled !== false
    });
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser && (!form.username.trim() || !form.fullName.trim())) {
      toast.error('Vui lòng nhập tên đăng nhập và họ tên');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          enabled: form.enabled,
          ...(form.password ? { password: form.password } : {})
        });
        toast.success('Cập nhật người dùng thành công!');
      } else {
        await api.post('/api/users', form);
        toast.success('Tạo tài khoản người dùng mới thành công!');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu người dùng');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.post(`/api/users/${user.id}/toggle-status`);
      toast.success(`Đã ${user.enabled ? 'khóa' : 'kích hoạt'} tài khoản @${user.username}`);
      fetchUsers();
    } catch (err) {
      toast.error('Không thể thay đổi trạng thái tài khoản');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn vô hiệu hóa tài khoản @${user.username} (${user.fullName})?`)) {
      return;
    }
    try {
      await api.delete(`/api/users/${user.id}`);
      toast.success('Đã vô hiệu hóa tài khoản thành công!');
      fetchUsers();
    } catch (err) {
      toast.error('Không thể vô hiệu hóa tài khoản');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200">Admin</span>;
      case 'DOCTOR':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">Bác sĩ</span>;
      case 'STAFF':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">Nhân viên</span>;
      case 'LAB_TECHNICIAN':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-purple-200">Kỹ thuật viên</span>;
      case 'PATIENT':
      default:
        return <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-200">Bệnh nhân</span>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng & Phân quyền</h1>
          <p className="text-gray-500 mt-1">Xem, thêm mới, phân quyền, khóa và cập nhật tài khoản toàn hệ thống</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm transition-colors flex items-center text-sm"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Thêm người dùng mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Tìm kiếm theo tên, username hoặc email..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-xl text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên (Admin)</option>
              <option value="DOCTOR">Bác sĩ (Doctor)</option>
              <option value="STAFF">Nhân viên tiếp nhận (Staff)</option>
              <option value="LAB_TECHNICIAN">Kỹ thuật viên xét nghiệm (Lab)</option>
              <option value="PATIENT">Bệnh nhân (Patient)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#ID</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tài khoản & Tên</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Liên hệ</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-2xs">
                          {(user.fullName || user.username || 'U').trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.fullName || '—'}</div>
                          <div className="text-xs text-gray-500 font-mono">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">{user.email || '—'}</div>
                      <div className="text-xs text-gray-500">{user.phone || 'Chưa cập nhật SĐT'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title="Bấm để bật/tắt khóa tài khoản"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition ${
                          user.enabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {user.enabled !== false ? <Unlock size={11} /> : <Lock size={11} />}
                        <span>{user.enabled !== false ? 'Hoạt động' : 'Đã khóa'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          title="Chỉnh sửa tài khoản"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-rose-600 hover:text-rose-900 p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                          title="Vô hiệu hóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination summary */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Hiển thị <span className="font-bold text-gray-800">{filteredUsers.length}</span> người dùng
          </span>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                {editingUser ? <Edit size={18} /> : <Plus size={18} />}
                {editingUser ? `Chỉnh sửa tài khoản @${editingUser.username}` : 'Thêm tài khoản người dùng mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Tên đăng nhập (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: dr_nam, receptionist1..."
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Họ và tên đầy đủ *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: BS. Nguyễn Văn A, Trần Thị B..."
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="bacsi@medicare.vn"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0912345678"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Vai trò hệ thống *</label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="STAFF">Nhân viên tiếp nhận (STAFF)</option>
                    <option value="DOCTOR">Bác sĩ khám bệnh (DOCTOR)</option>
                    <option value="LAB_TECHNICIAN">Kỹ thuật viên xét nghiệm (LAB)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                    <option value="PATIENT">Bệnh nhân (PATIENT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {editingUser ? 'Đổi mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu khởi tạo'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? 'Nhập mật khẩu mới...' : 'Mặc định: Password@123'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Special doctor fields */}
              {form.role === 'DOCTOR' && !editingUser && (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/60 space-y-3">
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Building2 size={14} /> Thông tin Bác sĩ chuyên khoa:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Chuyên khoa trực thuộc</label>
                      <select
                        value={form.departmentId}
                        onChange={e => setForm({ ...form, departmentId: e.target.value })}
                        className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Số chứng chỉ hành nghề</label>
                      <input
                        type="text"
                        placeholder="VD: CCHN-12345/BYT"
                        value={form.licenseNo}
                        onChange={e => setForm({ ...form, licenseNo: e.target.value })}
                        className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Chuyên môn / Học vị</label>
                      <input
                        type="text"
                        placeholder="VD: Bác sĩ CKI Nội Tổng Quát, ThS.BS Tim Mạch..."
                        value={form.specialization}
                        onChange={e => setForm({ ...form, specialization: e.target.value })}
                        className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingUser && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="userEnabled"
                    checked={form.enabled}
                    onChange={e => setForm({ ...form, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="userEnabled" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Cho phép tài khoản hoạt động (Mở khóa đăng nhập)
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingUser ? 'Cập nhật' : 'Tạo tài khoản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;

