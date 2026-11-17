import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  FlaskConical,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Edit,
  Trash2
} from 'lucide-react';

const CATEGORIES = [
  { key: 'ALL',          label: 'Tất cả',             bg: 'bg-slate-100',   text: 'text-slate-700',   active: 'bg-slate-900 text-white' },
  { key: 'BLOOD',        label: 'Huyết học',          bg: 'bg-rose-50',     text: 'text-rose-700',    active: 'bg-rose-600 text-white' },
  { key: 'URINE',        label: 'Nước tiểu',          bg: 'bg-amber-50',    text: 'text-amber-700',   active: 'bg-amber-600 text-white' },
  { key: 'BIOCHEMISTRY', label: 'Sinh hóa',           bg: 'bg-blue-50',     text: 'text-blue-700',    active: 'bg-blue-600 text-white' },
  { key: 'MICROBIOLOGY', label: 'Vi sinh',            bg: 'bg-emerald-50',  text: 'text-emerald-700', active: 'bg-emerald-600 text-white' },
  { key: 'IMAGING',      label: 'Chẩn đoán hình ảnh', bg: 'bg-indigo-50',   text: 'text-indigo-700',  active: 'bg-indigo-600 text-white' },
  { key: 'OTHER',        label: 'Khác',               bg: 'bg-slate-100',   text: 'text-slate-600',   active: 'bg-slate-600 text-white' },
];

const getCategoryStyle = (key) =>
  CATEGORIES.find(c => c.key === key) || { label: key || 'Khác', bg: 'bg-slate-100', text: 'text-slate-600' };

const CategoryBadge = ({ category }) => {
  const style = getCategoryStyle(category);
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

const LabTestModal = ({ initialData, onClose, onSaved }) => {
  const [form, setForm] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    category: initialData?.category || 'BLOOD',
    unit: initialData?.unit || '',
    normalRange: initialData?.normalRange || '',
    description: initialData?.description || '',
    price: initialData?.price ?? 150000
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Vui lòng nhập mã và tên xét nghiệm');
      return;
    }

    setSaving(true);
    try {
      if (initialData?.id) {
        await api.put(`/api/catalog/lab-tests/${initialData.id}`, form);
        toast.success('Cập nhật chỉ số xét nghiệm thành công!');
      } else {
        await api.post('/api/catalog/lab-tests', form);
        toast.success('Thêm mới loại xét nghiệm thành công!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu xét nghiệm');
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
            {initialData?.id ? 'Chỉnh sửa danh mục xét nghiệm' : 'Thêm xét nghiệm mới vào danh mục'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/15 rounded-xl transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mã xét nghiệm *</label>
            <input
              type="text"
              required
              placeholder="VD: XN-001, CBC, GLU..."
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Đơn vị đo</label>
            <input
              type="text"
              placeholder="VD: g/dL, mmol/L, U/L, %..."
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tên kỹ thuật / xét nghiệm *</label>
            <input
              type="text"
              required
              placeholder="VD: Xét nghiệm Glucose máu, Tổng phân tích tế bào máu..."
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nhóm chuyên môn</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORIES.filter(c => c.key !== 'ALL').map(c => (
                <option key={c.key} value={c.key}>{c.label} ({c.key})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Khoảng tham chiếu bình thường</label>
            <input
              type="text"
              placeholder="VD: 3.9 - 6.1, Âm tính..."
              value={form.normalRange}
              onChange={e => setForm({ ...form, normalRange: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Đơn giá viện phí (VNĐ)</label>
            <input
              type="number"
              min="0"
              placeholder="150000"
              value={form.price}
              onChange={e => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mô tả / Ghi chú kỹ thuật</label>
            <input
              type="text"
              placeholder="Hướng dẫn nhịn ăn hoặc lưu ý lấy mẫu (nếu có)..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span>{initialData?.id ? 'Lưu thay đổi' : 'Thêm xét nghiệm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LabTestCatalogPage = () => {
  const [allTests, setAllTests] = useState([]);
  const [categoryTests, setCategoryTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/catalog/lab-tests');
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.content || []));
      setAllTests(data);
    } catch (e) {
      setError('Không thể tải danh mục xét nghiệm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCategory = useCallback(async (cat) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/catalog/lab-tests/category/${cat}`);
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setCategoryTests(data);
    } catch (e) {
      setError('Không thể tải dữ liệu nhóm xét nghiệm.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchTerm('');
    if (cat !== 'ALL') {
      fetchByCategory(cat);
    }
  };

  const displayed = useMemo(() => {
    const source = activeCategory === 'ALL' ? allTests : categoryTests;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return source;
    return source.filter(t =>
      (t.name || '').toLowerCase().includes(term) ||
      (t.code || '').toLowerCase().includes(term)
    );
  }, [allTests, categoryTests, activeCategory, searchTerm]);

  const handleOpenAdd = () => {
    setEditingTest(null);
    setShowModal(true);
  };

  const handleOpenEdit = (test) => {
    setEditingTest(test);
    setShowModal(true);
  };

  const handleDelete = async (test) => {
    if (!window.confirm(`Bạn có chắc muốn ngừng chỉ định xét nghiệm "${test.name}" (${test.code})?`)) {
      return;
    }

    try {
      await api.delete(`/api/catalog/lab-tests/${test.id}`);
      toast.success('Đã ngừng sử dụng xét nghiệm thành công!');
      await fetchAll();
      if (activeCategory !== 'ALL') fetchByCategory(activeCategory);
    } catch (err) {
      toast.error(err?.message || 'Không thể xóa xét nghiệm');
    }
  };

  const countFor = (cat) =>
    cat === 'ALL' ? allTests.length : allTests.filter(t => t.category === cat).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xs">
            <FlaskConical size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Danh mục Cận lâm sàng & Xét nghiệm</h1>
            <p className="text-sm text-slate-500">Quản lý kỹ thuật xét nghiệm, chẩn đoán hình ảnh và biểu giá viện phí</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          Thêm kỹ thuật mới
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const count = countFor(cat.key);
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                isActive
                  ? `${cat.active} border-transparent shadow-xs`
                  : `bg-white border-slate-200/80 ${cat.text} hover:bg-slate-50`
              }`}
            >
              {cat.label}
              {!loading && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : `${cat.bg} ${cat.text}`
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mã kỹ thuật cận lâm sàng..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 size={34} className="animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">Đang tải danh mục xét nghiệm...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <div>
            <p className="text-rose-700 font-semibold text-sm">{error}</p>
            <button onClick={fetchAll} className="text-rose-700 underline text-xs font-bold mt-1">Thử lại</button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Mã KT</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Tên kỹ thuật / Xét nghiệm</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Nhóm</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Khoảng tham chiếu</th>
                    <th className="text-left px-5 py-3.5 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Đơn vị</th>
                    <th className="text-right px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Đơn giá</th>
                    <th className="text-right px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        {searchTerm ? 'Không tìm thấy kỹ thuật phù hợp.' : 'Chưa có kỹ thuật nào trong nhóm này.'}
                      </td>
                    </tr>
                  ) : (
                    displayed.map((test, idx) => (
                      <tr key={test.id || idx} className="hover:bg-blue-50/30 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs bg-blue-50 text-blue-700 border border-blue-200/70 px-2 py-0.5 rounded-lg font-bold">
                            {test.code || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-[240px]">
                          <div className="truncate">{test.name || '—'}</div>
                          {test.description && <div className="text-xs text-slate-400 font-normal truncate">{test.description}</div>}
                        </td>
                        <td className="px-5 py-3.5">
                          <CategoryBadge category={test.category} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell">
                          {test.normalRange || <span className="text-slate-300 italic">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 hidden lg:table-cell">{test.unit || '—'}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-800 whitespace-nowrap">
                          {test.price != null ? `${Number(test.price).toLocaleString('vi-VN')} đ` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(test)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition"
                              title="Chỉnh sửa thông số xét nghiệm"
                            >
                              <Edit size={13} />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(test)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                              title="Ngừng chỉ định xét nghiệm"
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
            Hiển thị <strong className="text-slate-700">{displayed.length}</strong> kỹ thuật
            {activeCategory !== 'ALL' && ` · Nhóm: ${getCategoryStyle(activeCategory).label}`}
          </p>
        </>
      )}

      {showModal && (
        <LabTestModal
          initialData={editingTest}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            fetchAll();
            if (activeCategory !== 'ALL') fetchByCategory(activeCategory);
          }}
        />
      )}
    </div>
  );
};

export default LabTestCatalogPage;
