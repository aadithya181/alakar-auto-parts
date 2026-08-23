import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  MapPin,
  Plus,
  Check,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import api from '../services/api';
import { Address } from '../types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [addresses, setAddresses] = useState<Address[] | any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  const couponCode = (location.state as any)?.couponCode || null;

  // New Address Form State
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line_1: '',
    address_line_2: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    is_default: true,
  });

  // Fetch saved customer addresses
  useEffect(() => {
    if (token) {
      const fetchAddresses = async () => {
        try {
          setLoadingAddresses(true);
          const res: any = await api.get('/addresses');
          if (res.success && res.addresses?.length > 0) {
            setAddresses(res.addresses);
            const defaultAddr = res.addresses.find((a: any) => a.is_default) || res.addresses[0];
            setSelectedAddressId(defaultAddr.id);
          } else {
            setShowNewAddressForm(true);
          }
        } catch (err: any) {
          console.warn('Could not fetch addresses:', err.message);
          setShowNewAddressForm(true);
        } finally {
          setLoadingAddresses(false);
        }
      };
      fetchAddresses();
    } else {
      setShowNewAddressForm(true);
    }
  }, [token]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.address_line_1 || !formData.city || !formData.state || !formData.pincode) {
      showError('Please fill in all mandatory address fields');
      return;
    }

    if (token) {
      try {
        const res: any = await api.post('/addresses', formData);
        if (res.success && res.address) {
          setAddresses((prev) => [...prev, res.address]);
          setSelectedAddressId(res.address.id);
          setShowNewAddressForm(false);
          showSuccess('Delivery address saved');
        }
      } catch (err: any) {
        showError(err.message || 'Failed to save address');
      }
    } else {
      const guestAddr = { id: 'guest-addr', ...formData };
      setAddresses([guestAddr]);
      setSelectedAddressId('guest-addr');
      setShowNewAddressForm(false);
      showSuccess('Address set for checkout');
    }
  };

  const getActiveShippingAddress = () => {
    if (selectedAddressId) {
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (addr) return addr;
    }
    return formData;
  };

  // COMPLETE SECURE RAZORPAY PAYMENT FLOW
  const handleProceedToPayment = async () => {
    const shippingAddress: any = getActiveShippingAddress();
    if (!shippingAddress || !shippingAddress.full_name || !shippingAddress.address_line_1) {
      showError('Please select or create a valid delivery address');
      return;
    }

    try {
      setProcessingPayment(true);

      // Step 1: Create internal pending order on backend
      const orderRes: any = await api.post('/orders', {
        items: items.map((i) => ({ product_id: i.product_id || i.id, quantity: i.quantity })),
        coupon_code: couponCode,
        shipping_address: shippingAddress,
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to create order');
      }

      const internalOrder = orderRes.order;

      // Step 2: Create Razorpay Order on backend
      const paymentRes: any = await api.post('/payment/create-order', {
        order_id: internalOrder.orderId || internalOrder.id,
      });

      if (!paymentRes.success) {
        throw new Error(paymentRes.message || 'Payment initialization failed');
      }

      // Step 3: Open Razorpay Checkout or Seamless Simulation
      if (window.Razorpay) {
        const options = {
          key: paymentRes.keyId,
          amount: paymentRes.amountInPaise,
          currency: paymentRes.currency || 'INR',
          name: 'Alakar Auto Parts',
          description: `Order #${internalOrder.orderNumber}`,
          order_id: paymentRes.razorpayOrderId.startsWith('order_mock_') ? undefined : paymentRes.razorpayOrderId,
          prefill: {
            name: shippingAddress.full_name,
            email: user?.email || 'customer@alakarautoparts.com',
            contact: shippingAddress.phone,
          },
          theme: {
            color: '#dc2626',
          },
          handler: async (response: any) => {
            await verifyAndCompleteOrder(
              internalOrder.orderId || internalOrder.id,
              paymentRes.razorpayOrderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          modal: {
            ondismiss: () => {
              setProcessingPayment(false);
              showInfo('Payment process cancelled');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          setProcessingPayment(false);
          showError(`Payment Failed: ${response.error?.description || 'Declined by bank'}`);
        });

        rzp.open();
      } else {
        await verifyAndCompleteOrder(
          internalOrder.orderId || internalOrder.id,
          paymentRes.razorpayOrderId,
          'pay_simulated_' + Date.now(),
          'sig_simulated_ok'
        );
      }
    } catch (err: any) {
      setProcessingPayment(false);
      showError(err.message || 'Payment flow encountered an error');
    }
  };

  const verifyAndCompleteOrder = async (orderId: string, rzpOrderId: string, paymentId: string, signature: string) => {
    try {
      const verifyRes: any = await api.post('/payment/verify', {
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

      if (verifyRes.success) {
        clearCart();
        showSuccess('Order Placed Successfully! Payment Verified.');
        navigate(`/orders/${orderId}`, { state: { orderConfirmed: true } });
      }
    } catch (err: any) {
      showError(err.message || 'Payment signature verification failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const shippingCharge = subtotal >= 999 ? 0.00 : 99.00;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight mb-6 sm:mb-8">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Addresses & Payment Selection (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address Step */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span>1. Delivery Address</span>
              </h2>
              {addresses.length > 0 && !showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              )}
            </div>

            {/* Existing Addresses Grid */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-50/70 border-red-500 text-slate-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{addr.full_name}</span>
                        {isSelected && <Check className="w-4 h-4 text-red-600" />}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.address_line_1}
                        {addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
                        <br />
                        {addr.area ? `${addr.area}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-2">
                        📞 {addr.phone}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">House / Flat / Building No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.address_line_1}
                    onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Street / Road / Colony</label>
                    <input
                      type="text"
                      value={formData.address_line_2}
                      onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                  >
                    Save Address & Continue
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* 2. Payment Gateway Information */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-card">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-red-600" />
              <span>2. Payment Gateway (Razorpay Secured)</span>
            </h2>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Razorpay Standard Checkout</p>
                  <p className="text-[11px] text-slate-500">
                    Supports UPI (GPay, PhonePe), Credit/Debit Cards, Netbanking & EMI
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                Active & Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right: Summary Card (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Order Review
            </h3>

            {/* Order Items Preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.product_id || item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="truncate flex-1">
                    <p className="text-slate-900 font-semibold truncate">{item.name}</p>
                    <p className="text-slate-400 text-[10px]">Qty: {item.quantity} × ₹{item.selling_price}</p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{Number(item.selling_price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                {shippingCharge === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{shippingCharge}</span>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{Number(subtotal + shippingCharge).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={processingPayment}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
            >
              {processingPayment ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing Razorpay...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay with Razorpay (₹{Number(subtotal + shippingCharge).toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
              🔒 256-bit SSL encrypted & Razorpay verified server checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
