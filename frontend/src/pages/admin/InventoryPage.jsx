import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Plus, AlertTriangle, Pill, X, Save, RefreshCw, Calendar, CheckCircle2, ShieldAlert, Sparkles, ArrowDownRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL'); // ALL, LOW_STOCK, EXPIRING
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    lowStockCount: 0,
    expiringCount: 0,
    totalItems: 0,
    totalValue: 0
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    medicationId: '',
    lotNumber: '',
    expiryDate: '',
    quantity: '',
    costPrice: '',
    sellingPrice: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    fetchInventory();
    fetchMedications();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/pharmacy/inventory');
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setInventory(data);
      
      // Calculate stats
      let low = 0, exp = 0, totalVal = 0;
      data.forEach(item => {
        const qty = item.stockQuantity ?? item.quantity ?? 0;
        const reorder = item.reorderLevel ?? 10;
        const price = item.sellingPrice ?? 0;

        if (item.isLowStock || qty <= reorder) low++;
        
        const daysToExpiry = item.expiryDate ? dayjs(item.expiryDate).diff(dayjs(), 'day') : 999;
        if (item.isExpiringSoon || (daysToExpiry <= 30 && daysToExpiry >= 0)) exp++;
        
        totalVal += (qty * price);
      });
      
      setStats({
        lowStockCount: low,
        expiringCount: exp,
        totalItems: data.length,
        totalValue: totalVal
      });
      
    } catch (error) {
      console.error('Lỗi khi tải kho thuốc:', error);
      toast.error('Lỗi khi tải dữ liệu kho thuốc');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async () => {
    try {
      const res = await api.get('/api/catalog/medications');
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setMedications(data);
    } catch (error) {
      console.error('Lỗi tải danh mục thuốc:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStock = async (e) => {
    if (e) e.preventDefault();
    if (!formData.medicationId || !formData.lotNumber || !formData.expiryDate || !formData.quantity) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      // Backend @RequestParam: medicationId, lotNumber, expiryDate, quantity, costPrice, sellingPrice
      await api.post('/api/pharmacy/inventory', null, {
        params: {
          medicationId: formData.medicationId,
          lotNumber: formData.lotNumber,
          expiryDate: formData.expiryDate,
          quantity: parseInt(formData.quantity, 10),
          costPrice: parseFloat(formData.costPrice || 0),
          sellingPrice: parseFloat(formData.sellingPrice || 0)
        }
      });
      toast.success('Nhập kho thuốc thành công!');
      setShowModal(false);
      setFormData({ medicationId: '', lotNumber: '', expiryDate: '', quantity: '', costPrice: '', sellingPrice: '' });
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi nhập kho');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const name = (item.medicationName || item.name || '').toLowerCase();
    const generic = (item.genericName || item.activeIngredient || '').toLowerCase();
    const lot = (item.lotNumber || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || generic.includes(search) || lot.includes(search);
    if (!matchesSearch) return false;
    
    const qty = item.stockQuantity ?? item.quantity ?? 0;
    const reorder = item.reorderLevel ?? 10;
    const daysToExpiry = item.expiryDate ? dayjs(item.expiryDate).diff(dayjs(), 'day') : 999;

    if (tab === 'LOW_STOCK') return item.isLowStock || (qty <= reorder);
    if (tab === 'EXPIRING') return item.isExpiringSoon || (daysToExpiry <= 30);
    
    return true;
  });

  const getStatusBadge = (item) => {
    const qty = item.stockQuantity ?? item.quantity ?? 0;
    const reorder = item.reorderLevel ?? 10;
    const daysToExpiry = item.expiryDate ? dayjs(item.expiryDate).diff(dayjs(), 'day') : 999;
    
    if (qty === 0) {
      return <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">HẾT HÀNG</span>;
    }
    
    if (daysToExpiry <= 30) {
      return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">SẮP HẾT HẠN</span>;
    }
    
    if (item.isLowStock || qty <= reorder) {
      return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-200">SẮP HẾT</span>;
    }
    
    return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">CÒN HÀNG</span>;
  };

  const formatCurrency = (amount) => (amount || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-teal-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Phân Hệ Quản Lý Dược Bệnh Viện (GPP)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Kho Dược Phẩm & Tồn Kho Thuốc
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Kiểm soát nhập xuất tồn, hạn dùng và cảnh báo lượng tồn tối thiểu
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setShowModal(true)}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nhập Kho Thuốc</span>
            </button>
            <button
              onClick={fetchInventory}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-2xl font-semibold text-sm transition-all flex items-center space-x-2 backdrop-blur-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.lowStockCount > 0 && (
          <div 
            onClick={() => setTab('LOW_STOCK')}
            className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 flex items-start cursor-pointer hover:bg-rose-50 transition-all group"
          >
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl mr-4 group-hover:scale-105 transition-transform flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-rose-900 font-black text-sm">Cảnh Báo Tồn Kho Dưới Ngưỡng</h4>
              <p className="text-rose-600 text-xs mt-1">
                Có <strong className="font-black text-rose-800">{stats.lowStockCount}</strong> mặt hàng thuốc sắp hết hoặc đã hết hàng. Bấm để xem danh sách.
              </p>
            </div>
          </div>
        )}
        
        {stats.expiringCount > 0 && (
          <div 
            onClick={() => setTab('EXPIRING')}
            className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 flex items-start cursor-pointer hover:bg-amber-50 transition-all group"
          >
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl mr-4 group-hover:scale-105 transition-transform flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-amber-900 font-black text-sm">Cảnh Báo Hạn Sử Dụng (Dưới 30 ngày)</h4>
              <p className="text-amber-700 text-xs mt-1">
                Có <strong className="font-black text-amber-800">{stats.expiringCount}</strong> lô thuốc sắp hết hạn sử dụng. Cần ưu tiên xuất trước.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Mặt Hàng</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalItems}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mr-4">
            <Save className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Giá Trị Kho</p>
            <h3 className="text-2xl font-black text-teal-700 mt-0.5">{formatCurrency(stats.totalValue)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mr-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cần Tái Đặt Hàng</p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats.lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="border-b border-slate-100 p-6 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setTab('ALL')} 
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                tab === 'ALL' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({inventory.length})
            </button>
            <button 
              onClick={() => setTab('LOW_STOCK')} 
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                tab === 'LOW_STOCK' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sắp hết / Hết hàng ({stats.lowStockCount})
            </button>
            <button 
              onClick={() => setTab('EXPIRING')} 
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                tab === 'EXPIRING' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sắp hết hạn ({stats.expiringCount})
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <input 
              type="text" 
              placeholder="Tìm tên thuốc, hoạt chất, số lô..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">Tên thuốc</th>
                <th className="py-4 px-4">Dạng / Hoạt chất</th>
                <th className="py-4 px-4">Số lô / Hạn SD</th>
                <th className="py-4 px-4 text-center">Tồn kho / Ngưỡng</th>
                <th className="py-4 px-6 text-right">Giá bán</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                    Đang đồng bộ dữ liệu kho thuốc...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy dữ liệu thuốc phù hợp
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const qty = item.stockQuantity ?? item.quantity ?? 0;
                  const reorder = item.reorderLevel ?? 10;
                  const isLow = item.isLowStock || qty <= reorder;
                  const daysToExpiry = item.expiryDate ? dayjs(item.expiryDate).diff(dayjs(), 'day') : 999;
                  const isExpiring = item.isExpiringSoon || (daysToExpiry <= 30 && daysToExpiry >= 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {item.medicationName || item.name || 'Không rõ tên'}
                        {item.strength && <span className="ml-1 text-xs text-slate-400 font-normal">({item.strength})</span>}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-800 font-medium">{item.dosageForm || 'Viên nén'}</div>
                        <div className="text-slate-400 text-xs">{item.genericName || item.activeIngredient || '---'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-700">{item.lotNumber || 'Lô N/A'}</div>
                        <div className={`text-xs font-bold mt-0.5 ${isExpiring ? 'text-rose-500' : 'text-slate-500'}`}>
                          {item.expiryDate ? dayjs(item.expiryDate).format('DD/MM/YYYY') : '---'}
                          {isExpiring && <span className="ml-1 text-[10px]">({daysToExpiry} ngày)</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-black text-base ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {qty}
                        </span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-slate-400 text-xs">{reorder}</span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-teal-700">
                        {formatCurrency(item.sellingPrice)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(item)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Nhập Kho Dược Phẩm</h2>
                <p className="text-xs text-slate-500 mt-0.5">Nhập lô thuốc mới vào hệ thống quản lý</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitStock} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dược phẩm / Thuốc *</label>
                <select 
                  name="medicationId" 
                  value={formData.medicationId} 
                  onChange={handleInputChange} 
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  <option value="">-- Chọn thuốc từ danh mục --</option>
                  {medications.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.strength ? `(${m.strength})` : ''} - {m.genericName || ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số Lô (Lot Number) *</label>
                  <input 
                    type="text" 
                    name="lotNumber" 
                    placeholder="VD: LOT-2026A"
                    value={formData.lotNumber} 
                    onChange={handleInputChange} 
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hạn Sử Dụng *</label>
                  <input 
                    type="date" 
                    name="expiryDate" 
                    value={formData.expiryDate} 
                    onChange={handleInputChange} 
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số Lượng Nhập *</label>
                <input 
                  type="number" 
                  name="quantity" 
                  placeholder="VD: 500"
                  min="1"
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá Nhập (VNĐ)</label>
                  <input 
                    type="number" 
                    name="costPrice" 
                    placeholder="VD: 25000"
                    value={formData.costPrice} 
                    onChange={handleInputChange} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá Bán Niêm Yết (VNĐ)</label>
                  <input 
                    type="number" 
                    name="sellingPrice" 
                    placeholder="VD: 35000"
                    value={formData.sellingPrice} 
                    onChange={handleInputChange} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 -mx-6 -mb-6 mt-6 rounded-b-3xl">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-sm flex items-center space-x-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? 'Đang lưu...' : 'Lưu Vào Kho'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
