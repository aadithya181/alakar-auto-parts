import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Plus
} from 'lucide-react';
import api from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/admin/stats');
        if (res.success) {
          setStats(res.stats);
          setRecentOrders(res.recentOrders || []);
          setLowStockProducts(res.lowStockProducts || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Automotive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on revenue, part inventory levels, and order fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Part
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Sales</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{Number(stats?.totalSales || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">
            Verified Razorpay revenue
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {stats?.pendingOrders || 0} pending fulfillment
          </p>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Catalog SKUs</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalProducts || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            Active automotive spare parts
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{stats?.lowStockCount || 0}</p>
          <p className="text-[10px] text-rose-600 font-semibold mt-1">
            Requires warehouse reorder
          </p>
        </div>
      </div>

      {/* Grid: Low Stock Alert List + Recent Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Recent Orders (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-red-600 hover:text-red-700">
              View All Orders →
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card">
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord: any) => (
                <div key={ord.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-red-600">#{ord.order_number}</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{ord.customer_name || 'Customer'}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900">
                      ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                    </span>
                    <span className="block mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      {ord.order_status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Low Stock Inventory Alerts</h3>
          <div className="rounded-3xl bg-white border border-slate-200 p-4 space-y-3 shadow-card">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs">
                  <div className="truncate flex-1 pr-2">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-[11px] border border-rose-300 shrink-0">
                    {p.stock_quantity} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">All inventory levels healthy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
