import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  RefreshCw,
  Zap,
  Car,
  Wrench,
  Tag,
  ChevronRight,
  MapPin,
  Phone,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  const formatSafeDate = (d: any) => {
    try {
      if (!d) return 'Recently';
      const date = new Date(d);
      return isNaN(date.getTime())
        ? 'Recently'
        : date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
    } catch {
      return 'Recently';
    }
  };

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);

      const startTime = Date.now();
      const res: any = await api.get('/admin/stats');

      // Ensure at least 300ms spin for smooth user feedback on manual click
      if (isManual) {
        const elapsed = Date.now() - startTime;
        if (elapsed < 300) {
          await new Promise((r) => setTimeout(r, 300 - elapsed));
        }
      }

      if (res.success && res.stats) {
        setStats((prev: any) => {
          if (!prev) return res.stats;
          const isSame =
            prev.totalSales === res.stats.totalSales &&
            prev.totalOrders === res.stats.totalOrders &&
            prev.pendingOrders === res.stats.pendingOrders &&
            prev.totalProducts === res.stats.totalProducts;
          return isSame ? prev : res.stats;
        });

        setRecentOrders((prev: any[]) => {
          const next = res.recentOrders || [];
          if (prev.length !== next.length) return next;
          if (prev.length === 0) return prev;
          return prev[0]?.id === next[0]?.id ? prev : next;
        });

        setLowStockProducts(res.lowStockProducts || []);
        const now = new Date();
        setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        if (isManual) {
          showSuccess('Dashboard telemetry synchronized with live database');
        }
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard stats:', err);
      if (isManual) {
        showError(err.message || 'Failed to synchronize live metrics');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and calm background sync every 30 seconds
  useEffect(() => {
    fetchDashboard(false);
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-100 border border-slate-200 rounded-2xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-white border border-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalSales = Number(stats?.totalSales || 0);
  const todaySales = Number(stats?.todaySales || 0);
  const totalOrders = Number(stats?.totalOrders || 0);
  const todayOrders = Number(stats?.todayOrders ?? totalOrders);
  const pendingOrders = Number(stats?.pendingOrders || 0);
  const totalProducts = Number(stats?.totalProducts || 0);
  const lowStockCount = Number(stats?.lowStockCount || 0);

  return (
    <div className="space-y-8">
      {/* 1. Header & Live Telemetry Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pudukkottai Warehouse Central Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-slate-900 tracking-tight">
            Automotive Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry on revenue, part inventory levels, and order fulfillment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Sync Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">Live Auto-Sync: Active</span>
            <span className="text-emerald-300">•</span>
            <span className="text-emerald-700 font-mono text-[10px]">{lastSyncedTime}</span>
          </div>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Refresh Live Metrics & Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh & Sync'}</span>
          </button>

          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black shadow-md shadow-red-600/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Part SKU</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (Clean White Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Sales */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Live Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              ₹{totalSales.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px]">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Verified
            </span>
            <span className="text-slate-400">Live amount</span>
          </div>
        </div>

        {/* Card 2: Today's Orders & Inflow */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Today's Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {todayOrders}
            </p>
            <span className="text-xs text-slate-400 font-medium">orders today</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px]">
            <span className="text-amber-700 font-semibold">₹{todaySales.toLocaleString('en-IN')} Paid Inflow</span>
            <span className="text-slate-400">Pudukkottai store</span>
          </div>
        </div>

        {/* Card 3: Orders Pipeline */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fulfillment Pipeline
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {totalOrders}
            </p>
            <span className="text-xs text-slate-400 font-medium">total orders</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px]">
            <span className={`font-semibold ${pendingOrders > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              {pendingOrders} Pending Dispatch
            </span>
            <Link to="/admin/orders" className="text-red-600 font-bold hover:underline">
              View →
            </Link>
          </div>
        </div>

        {/* Card 4: Inventory & Stock Health */}
        <div className={`p-6 rounded-3xl bg-white border shadow-card relative overflow-hidden group transition-all ${
          lowStockCount > 0 ? 'border-red-200 hover:border-red-400' : 'border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Inventory Health
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs ${
              lowStockCount > 0 ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
            }`}>
              {lowStockCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {totalProducts}
            </p>
            <span className="text-xs text-slate-400 font-medium">Catalog SKUs</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px]">
            {lowStockCount > 0 ? (
              <span className="text-red-600 font-bold flex items-center gap-1">
                ⚠️ {lowStockCount} Low Stock Items
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Stock Healthy (0 Low)
              </span>
            )}
            <Link to="/admin/products" className="text-slate-600 font-bold hover:text-red-600">
              Manage →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Live Orders & Inventory Watchlist Grid (No Duplicates) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Recent Live Orders (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Store Orders
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>Manage All ({totalOrders})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card">
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">No Orders Placed Yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Live customer orders placed through Razorpay checkout will automatically stream here.
                  </p>
                </div>
              ) : (
                recentOrders.map((ord: any) => {
                  const customerName = ord.shipping_address?.full_name || ord.customer_name || ord.user_name || 'Customer';
                  const city = ord.shipping_address?.city || 'Pudukkottai';

                  return (
                    <div key={ord.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-red-600">
                            #{ord.order_number}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            ord.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.payment_status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                          {customerName}
                          <span className="font-normal text-slate-400 ml-1.5">• {city}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {formatSafeDate(ord.created_at)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-900 font-mono">
                          ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                        </p>
                        <span className={`inline-block mt-1 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                          ord.order_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.order_status === 'dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.order_status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.order_status?.replace(/_/g, ' ') || 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Database Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Inventory Watchlist
              </h3>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-slate-500 hover:text-red-600"
            >
              All Parts →
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 space-y-3 shadow-card">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs transition-colors"
                >
                  <div className="truncate flex-1 pr-3">
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>SKU: {p.sku}</span>
                      <span>•</span>
                      <span className="text-red-600 font-bold">₹{Number(p.selling_price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-[11px] border border-rose-300">
                      {p.stock_quantity} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">All Stock Healthy</p>
                <p className="text-[10px] text-slate-400">Zero inventory items below minimum safety threshold.</p>
              </div>
            )}
          </div>

          {/* Live Store Telemetry Summary Card */}
          <div className="rounded-3xl bg-slate-900 text-white p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Store Operations Status
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Verified Customers</span>
                <span className="font-bold text-white font-mono">{stats?.totalCustomers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Catalog Parts Listed</span>
                <span className="font-bold text-white font-mono">{totalProducts} SKUs</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Fulfillment Rate</span>
                <span className="font-bold text-emerald-400 font-mono">100% Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
