import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  Pill,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';

const DOSAGE_FORM_STYLES = {
  TABLET:    { label: 'Viên nén',  bg: 'bg-blue-50',   text: 'text-blue-700' },
  CAPSULE:   { label: 'Viên nang', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  SYRUP:     { label: 'Siro',      bg: 'bg-amber-50',  text: 'text-amber-700' },
  INJECTION: { label: 'Ống tiêm',  bg: 'bg-rose-50',   text: 'text-rose-700' },
  AMPOULE:   { label: 'Ống',       bg: 'bg-rose-50',   text: 'text-rose-700' },
  SOLUTION:  { label: 'Dung dịch', bg: 'bg-cyan-50',   text: 'text-cyan-700' },
  CREAM:     { label: 'Kem bôi',   bg: 'bg-pink-50',   text: 'text-pink-700' },
  OINTMENT:  { label: 'Thuốc mỡ',  bg: 'bg-orange-50', text: 'text-orange-700' },
  DROPS:     { label: 'Nhỏ giọt',  bg: 'bg-teal-50',   text: 'text-teal-700' },
  BOTTLE:    { label: 'Chai',      bg: 'bg-purple-50', text: 'text-purple-700' },
  POWDER:    { label: 'Gói bột',   bg: 'bg-amber-50',  text: 'text-amber-700' },
};

const PAGE_SIZE = 15;

const DosageBadge = ({ form }) => {
  const style = DOSAGE_FORM_STYLES[form?.toUpperCase()] || { label: form || 'Khác', bg: 'bg-slate-100', text: 'text-slate-600' };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

const MedicationModal = ({ initialData, onClose, onSaved }) => {
  const [form, setForm] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    genericName: initialData?.genericName || '',
    dosageForm: initialData?.dosageForm || 'TABLET',
    strength: initialData?.strength || '',
    unit: initialData?.unit || 'Viên',
    manufacturer: initialData?.manufacturer || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Vui lòng nhập mã thuốc và tên thuốc');
      return;
    }

    setSaving(true);
    try {
      if (initialData?.id) {
        await api.put(`/api/catalog/medications/${initialData.id}`, form);
        toast.success('Cập nhật thông tin thuốc thành công!');
      } else {
        await api.post('/api/catalog/medications', form);
        toast.success('Thêm mới thuốc vào danh mục thành công!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu thuốc');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            {initialData?.id ? <Edit size={18} className="text-teal-400" /> : <Plus size={18} className="text-teal-400" />}
            {initialData?.id ? 'Chỉnh sửa thông tin dược phẩm' : 'Thêm thuốc mới vào danh mục'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/15 rounded-xl transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mã thuốc *</label>
            <input
              type="text"
              required
              placeholder="VD: MED-001, PARA500..."
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Đơn vị tính *</label>
            <input
              type="text"
              required
              placeholder="VD: Viên, Vỉ, Hộp, Chai..."
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tên biệt dược (Tên thuốc) *</label>
            <input
              type="text"
              required
              placeholder="VD: Panadol Extra, Augmentin..."
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Hoạt chất (Generic Name — phục vụ kiểm tra tương tác thuốc)</label>
            <input
              type="text"
              placeholder="VD: Paracetamol, Amoxicillin + Clavulanic acid..."
              value={form.genericName}
              onChange={e => setForm({ ...form, genericName: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Hàm lượng</label>
            <input
              type="text"
              placeholder="VD: 500mg, 625mg, 10ml..."
              value={form.strength}
              onChange={e => setForm({ ...form, strength: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Hãng sản xuất / Xuất xứ</label>
            <input
              type="text"
              placeholder="VD: Dược Hậu Giang, GSK..."
              value={form.manufacturer}
              onChange={e => setForm({ ...form, manufacturer: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Dạng bào chế</label>
            <select
              value={form.dosageForm}
              onChange={e => setForm({ ...form, dosageForm: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Object.entries(DOSAGE_FORM_STYLES).map(([key, val]) => (
                <option key={key} value={key}>{val.label} ({key})</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span>{initialData?.id ? 'Lưu thay đổi' : 'Thêm thuốc'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MedicationCatalogPage = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const fetchMedications = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (q && q.trim()) {
        res = await api.get(`/api/catalog/medications/search?q=${encodeURIComponent(q.trim())}`);
      } else {
        res = await api.get('/api/catalog/medications');
      }
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.content || []));
      setMedications(data);
    } catch (e) {
      setError('Không thể tải danh mục thuốc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedications(debouncedSearch); }, [debouncedSearch, fetchMedications]);

  const handleOpenAdd = () => {
    setEditingMed(null);
    setShowModal(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setShowModal(true);
  };

  const handleDelete = async (med) => {
    if (!window.confirm(`Bạn có chắc muốn ngừng sử dụng thuốc "${med.name}" (${med.code})?`)) {
      return;
    }

    try {
      await api.delete(`/api/catalog/medications/${med.id}`);
      toast.success('Đã ngừng sử dụng thuốc thành công!');
      fetchMedications(debouncedSearch);
    } catch (err) {
      toast.error(err?.message || 'Không thể xóa thuốc');
    }
  };

  const totalPages = Math.max(1, Math.ceil(medications.length / PAGE_SIZE));
  const paged = medications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-600 rounded-2xl text-white shadow-xs">
            <Pill size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Danh mục Thuốc & Dược phẩm</h1>
            <p className="text-sm text-slate-500">Quản lý biệt dược, hoạt chất gốc và dữ liệu cảnh báo an toàn dược lâm sàng</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          Thêm thuốc mới
        </button>
      </div>

      {/* Toolbar & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã thuốc, tên biệt dược hoặc hoạt chất..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-2xs"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 shrink-0">
          Tổng <strong className="text-slate-900">{medications.length}</strong> dược phẩm đang lưu hành
          {debouncedSearch && <span className="text-teal-700"> · Từ khóa "{debouncedSearch}"</span>}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 size={34} className="animate-spin text-teal-600" />
          <p className="text-slate-500 text-sm">Đang tải danh mục thuốc...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <div>
            <p className="text-rose-700 font-semibold text-sm">{error}</p>
            <button onClick={() => fetchMedications(debouncedSearch)} className="text-rose-700 underline text-xs font-bold mt-1">Thử lại</button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Mã thuốc</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Tên biệt dược</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Hoạt chất (Generic)</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Dạng bào chế</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Hàm lượng</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider hidden xl:table-cell">Hãng SX</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Đơn vị</th>
                    <th className="text-right px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        {debouncedSearch ? 'Không tìm thấy dược phẩm nào phù hợp.' : 'Danh mục thuốc hiện đang trống.'}
                      </td>
                    </tr>
                  ) : (
                    paged.map((med, idx) => (
                      <tr key={med.id || idx} className="hover:bg-teal-50/30 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs bg-teal-50 text-teal-800 border border-teal-200/70 px-2 py-0.5 rounded-lg font-bold">
                            {med.code || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-[200px] truncate">{med.name || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600 hidden lg:table-cell max-w-[180px] truncate">
                          {med.genericName || <span className="italic text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <DosageBadge form={med.dosageForm} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell">{med.strength || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-500 hidden xl:table-cell max-w-[140px] truncate">
                          {med.manufacturer || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell">{med.unit || '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(med)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition"
                              title="Chỉnh sửa thông tin thuốc"
                            >
                              <Edit size={13} />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(med)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                              title="Ngừng sử dụng thuốc"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-400">
                Trang <strong className="text-slate-700">{page}</strong>/{totalPages} · {medications.length} dược phẩm
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-8 h-8 text-xs rounded-xl font-bold transition ${
                        pg === page
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <MedicationModal
          initialData={editingMed}
          onClose={() => setShowModal(false)}
          onSaved={() => fetchMedications(debouncedSearch)}
        />
      )}
    </div>
  );
};

export default MedicationCatalogPage;
