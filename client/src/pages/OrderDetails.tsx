import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  Check,
  MapPin,
  CreditCard,
  Printer,
  AlertCircle
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import api from '../services/api';
import { Order } from '../types';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/orders/${id}`);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const stages = [
    { key: 'pending', label: 'Order Placed', desc: 'Order received in system' },
    { key: 'confirmed', label: 'Payment Confirmed', desc: 'Verified via Razorpay' },
    { key: 'processing', label: 'Processing', desc: 'Allocated in warehouse' },
    { key: 'packed', label: 'Packed', desc: 'Tamper-proof sealed' },
    { key: 'shipped', label: 'Shipped', desc: 'Handed to express courier' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier out on route' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered to customer' },
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx === -1 ? 1 : idx;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 bg-slate-100 rounded-xl w-1/3 mx-auto mb-4" />
        <div className="h-40 bg-slate-100 rounded-2xl mb-6" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">We couldn't retrieve the details for this order ID.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const currentStageIndex = getStageIndex(order.order_status || order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      <Breadcrumbs items={[{ label: 'Orders', href: '/account?tab=orders' }, { label: `Order #${order.order_number}` }]} />

      {/* Confirmation Success Header if navigated from checkout */}
      {location.state?.orderConfirmed && (
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Payment Confirmed & Order Placed!</h2>
              <p className="text-xs text-slate-600">
                A confirmation has been sent to your email with Tracking ID: <span className="font-mono text-emerald-700 font-bold">{order.order_number}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200 shrink-0 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      )}

      {/* Order Header Information */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Automotive Order</span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Order #{order.order_number}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Placed on {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
            order.payment_status === 'paid'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            Payment: {order.payment_status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 border border-red-200 text-red-700">
            Status: {(order.order_status || order.status || '').replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Visual Tracking Progress Timeline */}
      <div className="p-5 sm:p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-card">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2">
          <Truck className="w-4 h-4 text-red-600" />
          <span>Fulfillment & Dispatch Progression</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 relative">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'bg-slate-100 border border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-red-100' : ''}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <h4 className={`text-[11px] sm:text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                  {stage.label}
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-snug">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>

        {order.tracking_number && (
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-500">Courier Tracking Details</p>
              <p className="text-xs font-bold text-slate-900">
                {order.courier_name || 'Blue Dart Express'} • AWB: <span className="font-mono text-red-600">{order.tracking_number}</span>
              </p>
            </div>
            <span className="text-xs text-slate-600 font-medium">
              Estimated Delivery: <span className="text-slate-900 font-bold">{order.estimated_delivery || 'Within 2-3 Days'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Order Items & Shipping Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Items list (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-card">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-red-600" />
              <span>Purchased Products ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <img
                      src={item.image_url || item.product_image || 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=200'}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.product_name || item.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku || item.product_sku}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        ₹{Number(item.price || item.unit_price).toLocaleString('en-IN')} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900">
                      ₹{Number(item.total || item.total_price || (item.unit_price * item.quantity)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery & Payment Info (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Delivery Address */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" /> Delivery Address
            </h4>
            <p className="text-xs font-bold text-slate-900 mb-1">{order.shipping_address?.full_name}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {order.shipping_address?.address_line_1}
              {order.shipping_address?.address_line_2 ? `, ${order.shipping_address.address_line_2}` : ''}
              <br />
              {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
            </p>
            <p className="text-[11px] text-slate-500 mt-2">📞 {order.shipping_address?.phone}</p>
          </div>

          {/* Payment Breakdown */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card space-y-2.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-600" /> Payment Summary
            </h4>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.coupon_code || 'Promo'})</span>
                <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{order.shipping_charge === 0 || order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_charge || order.shipping_fee}`}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Tax (GST 18% inclusive)</span>
              <span>₹{Number(order.tax || order.tax_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-bold">
              <span className="text-slate-900 text-sm">Total Paid</span>
              <span className="text-lg font-black text-slate-900">
                ₹{Number(order.total_amount).toLocaleString('en-IN')}
              </span>
            </div>
            {order.razorpay_payment_id && (
              <p className="text-[10px] text-slate-400 pt-2 font-mono truncate">
                Razorpay ID: {order.razorpay_payment_id}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
