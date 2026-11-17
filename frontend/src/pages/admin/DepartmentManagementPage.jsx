import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  Hospital,
  Users,
  DoorOpen,
  Eye,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Edit,
  Trash2
} from 'lucide-react';

const DoctorCard = ({ doctor }) => (
  <div className="flex items-center gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm shrink-0">
      {(doctor.fullName || doctor.name || 'BS').charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate">{doctor.fullName || doctor.name || '—'}</p>
      <p className="text-xs text-slate-500 truncate">{doctor.specialization || doctor.email || 'Bác sĩ chuyên khoa'}</p>
    </div>
    {doctor.status && (
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
        doctor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
      }`}>
        {doctor.status === 'ACTIVE' ? 'Đang trực' : doctor.status}
      </span>
    )}
  </div>
);

const RoomCard = ({ room }) => (
  <div className="flex items-center gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
      <DoorOpen size={17} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate">{room.name || room.roomName || '—'}</p>
      <p className="text-xs text-slate-500 truncate">{room.code || room.roomCode || ''}{room.floor ? ` · Tầng ${room.floor}` : ''}</p>
    </div>
    {room.status && (
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
        room.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
      }`}>
        {room.status === 'ACTIVE' ? 'Hoạt động' : room.status}
      </span>
    )}
  </div>
);

const DepartmentDetailModal = ({ dept, onClose }) => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dept) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docRes, roomRes] = await Promise.all([
          api.get(`/api/departments/${dept.id}/doctors`),
          api.get(`/api/departments/${dept.id}/rooms`),
        ]);
        setDoctors(Array.isArray(docRes) ? docRes : (Array.isArray(docRes?.data) ? docRes.data : []));
        setRooms(Array.isArray(roomRes) ? roomRes : (Array.isArray(roomRes?.data) ? roomRes.data : []));
      } catch (e) {
        setError('Không thể tải dữ liệu chi tiết khoa.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [dept]);

  if (!dept) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Hospital size={20} className="text-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-base">{dept.name}</h2>
              <p className="text-slate-300 text-xs font-mono">Mã khoa: {dept.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/15 rounded-xl transition">
            <X size={18} />
          </button>
        </div>

        {dept.description && (
          <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100 text-xs text-slate-600">
            {dept.description}
          </div>
        )}

        <div className="flex border-b border-slate-200 px-6 pt-2">
          {[
            { key: 'doctors', label: 'Đội ngũ Bác sĩ', icon: Users },
            { key: 'rooms', label: 'Phòng khám trực thuộc', icon: DoorOpen },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${
                activeTab === key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={15} />
              {label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {key === 'doctors' ? doctors.length : rooms.length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-2xl">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {activeTab === 'doctors' && (
                doctors.length > 0
                  ? doctors.map((d, i) => <DoctorCard key={d.id || i} doctor={d} />)
                  : <p className="text-center text-slate-400 text-sm py-8">Chưa có bác sĩ trong chuyên khoa này.</p>
              )}
              {activeTab === 'rooms' && (
                rooms.length > 0
                  ? rooms.map((r, i) => <RoomCard key={r.id || i} room={r} />)
                  : <p className="text-center text-slate-400 text-sm py-8">Chưa có phòng khám trong chuyên khoa này.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/departments');
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setDepartments(data);
      setFiltered(data);
    } catch (e) {
      setError('Không thể tải danh sách chuyên khoa. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFiltered(departments);
    } else {
      setFiltered(departments.filter(d =>
        (d.name || '').toLowerCase().includes(term) ||
        (d.code || '').toLowerCase().includes(term) ||
        (d.description || '').toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, departments]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setForm({ code: '', name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setForm({ code: dept.code || '', name: dept.name || '', description: dept.description || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Vui lòng nhập mã và tên chuyên khoa');
      return;
    }

    setSaving(true);
    try {
      if (editingDept) {
        await api.put(`/api/departments/${editingDept.id}`, form);
        toast.success('Cập nhật chuyên khoa thành công!');
      } else {
        await api.post('/api/departments', form);
        toast.success('Thêm mới chuyên khoa thành công!');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu chuyên khoa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ẩn chuyên khoa "${dept.name}" (${dept.code})?`)) {
      return;
    }

    try {
      await api.delete(`/api/departments/${dept.id}`);
      toast.success('Đã ẩn chuyên khoa thành công!');
      fetchDepartments();
    } catch (err) {
      toast.error(err?.message || 'Không thể xóa chuyên khoa');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xs">
            <Hospital size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Phòng ban & Chuyên khoa</h1>
            <p className="text-sm text-slate-500">Danh mục chuyên khoa lâm sàng, buồng khám và nhân sự bác sĩ trực thuộc</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          Thêm chuyên khoa mới
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên khoa, mã chuyên khoa hoặc phạm vi điều trị..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 size={34} className="animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">Đang tải danh sách chuyên khoa...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <div>
            <p className="text-rose-700 font-semibold text-sm">{error}</p>
            <button onClick={fetchDepartments} className="text-rose-700 underline text-xs font-bold mt-1">Thử lại</button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Mã khoa</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Tên chuyên khoa</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Mô tả chuyên môn</th>
                    <th className="text-center px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Phòng khám</th>
                    <th className="text-right px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        Không tìm thấy chuyên khoa nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((dept, idx) => (
                      <tr key={dept.id || idx} className="hover:bg-blue-50/30 transition">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs bg-blue-50 text-blue-700 border border-blue-200/70 px-2.5 py-1 rounded-lg font-bold">
                            {dept.code || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">{dept.name || '—'}</td>
                        <td className="px-5 py-4 text-slate-500 hidden md:table-cell max-w-xs truncate">
                          {dept.description || <span className="italic text-slate-300">Chưa có mô tả</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 border border-teal-200/70 px-2.5 py-1 rounded-full text-xs font-bold">
                            <DoorOpen size={12} />
                            {dept.roomCount ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedDept(dept)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                              title="Xem chi tiết bác sĩ & phòng khám"
                            >
                              <Eye size={13} />
                              Chi tiết
                            </button>
                            <button
                              onClick={() => handleOpenEdit(dept)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit size={13} />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(dept)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                              title="Ẩn chuyên khoa"
                            >
                              <Trash2 size={13} />
                              Ẩn
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Hiển thị <strong className="text-slate-700">{filtered.length}</strong> / {departments.length} chuyên khoa
          </p>
        </>
      )}

      {selectedDept && (
        <DepartmentDetailModal dept={selectedDept} onClose={() => setSelectedDept(null)} />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                {editingDept ? <Edit size={18} className="text-teal-400" /> : <Plus size={18} className="text-teal-400" />}
                {editingDept ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/15 rounded-xl transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mã chuyên khoa *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: NOI, TIM, NHI, TMH..."
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tên chuyên khoa *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Khoa Nội tổng quát, Khoa Tim Mạch..."
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mô tả phạm vi điều trị</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả chức năng khám và điều trị chuyên sâu của khoa..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingDept ? 'Lưu thay đổi' : 'Tạo chuyên khoa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementPage;
