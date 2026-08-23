import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState<Order[] | any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Status Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [courierName, setCourierName] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/orders');
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenStatusModal = (ord: any) => {
    setSelectedOrder(ord);
    setNewStatus(ord.order_status || ord.status);
    setCourierName(ord.courier_name || 'Blue Dart Express');
    setTrackingNumber(ord.tracking_number || 'TRQ-' + Math.floor(100000 + Math.random() * 900000));
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdatingId(selectedOrder.id);
      await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        order_status: newStatus,
        courier_name: courierName,
        tracking_number: trackingNumber,
      });
      showSuccess(`Order status updated to "${newStatus}"`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      showError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) =>
    (o.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (o.customer_email && o.customer_email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Customer Orders & Logistics Fulfillment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor incoming customer orders, verify payment status, update courier tracking, and transition fulfillment status.
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by order number or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Order ID / Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items / Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-red-600">#{ord.order_number}</span>
                    <p className="text-[10px] text-slate-400">
                      {new Date(ord.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{ord.customer_name || ord.user_name || 'Customer'}</span>
                    <p className="text-[10px] text-slate-500">{ord.customer_email || ord.user_email}</p>
                    <p className="text-[10px] text-slate-400">{ord.shipping_address?.city}, {ord.shipping_address?.state}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">₹{Number(ord.total_amount).toLocaleString('en-IN')}</span>
                    <p className="text-[10px] text-slate-400">{ord.items?.length || 1} item(s)</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                      ord.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 text-slate-800">
                      {(ord.order_status || ord.status || '').replace(/_/g, ' ')}
                    </span>
                    {ord.tracking_number && (
                      <p className="text-[9px] text-slate-500 font-mono mt-1">AWB: {ord.tracking_number}</p>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors shadow-sm"
                      >
                        Update Status
                      </button>
                      <Link
                        to={`/orders/${ord.id}`}
                        target="_blank"
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Fulfillment Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">
              Update Order Status (#{selectedOrder.order_number})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Advance order logistics state and trigger tracking notifications.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                >
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Payment Confirmed</option>
                  <option value="processing">Processing in Warehouse</option>
                  <option value="packed">Packed & Sealed</option>
                  <option value="shipped">Shipped via Express</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered to Customer</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Blue Dart, Delhivery, DTDC"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tracking Number (AWB)</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRQ-892341"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId !== null}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                >
                  {updatingId ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
