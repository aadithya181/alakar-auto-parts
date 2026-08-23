import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminCoupons: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '10',
    minimum_order: '999',
    maximum_discount: '500',
    usage_limit: '1000',
  });

  const fetchCoupons = async () => {
    try {
      const res: any = await api.get('/admin/coupons');
      if (res.success) {
        setCoupons(res.coupons || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      showError('Code and discount value are required');
      return;
    }

    try {
      await api.post('/admin/coupons', formData);
      showSuccess('Coupon created successfully!');
      setShowCreateModal(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '10',
        minimum_order: '999',
        maximum_discount: '500',
        usage_limit: '1000',
      });
      fetchCoupons();
    } catch (err: any) {
      showError(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Promotional Coupons & Discounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create percentage or flat monetary discounts with minimum order thresholds.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((cp) => (
          <div key={cp.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-red-50 border border-red-200 text-red-700 font-mono font-black text-sm uppercase">
                {cp.code}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                {cp.status || 'Active'}
              </span>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900">
                {cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : `₹${cp.discount_value} FLAT OFF`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Min. Order: ₹{cp.minimum_order} {cp.maximum_discount ? `• Max Disc: ₹${cp.maximum_discount}` : ''}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Redeemed: {cp.used_count || 0} times</span>
              <span>Limit: {cp.usage_limit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Create New Promo Code</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 uppercase font-mono focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minimum_order}
                    onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maximum_discount}
                    onChange={(e) => setFormData({ ...formData, maximum_discount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
