import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Wrench,
  MapPin,
  Car,
  Bike,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicle, ActiveVehicleData } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import api from '../services/api';
import { Order, Address } from '../types';

export const Account: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { activeVehicle, setActiveVehicle, garageVehicles, saveToGarage } = useVehicle();
  const { showSuccess, showError } = useToast();

  const currentTab = searchParams.get('tab') || 'orders';
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add Vehicle modal state
  const [showAddVehicle, setShowAddVehicle] = useState<boolean>(false);
  const [vType, setVType] = useState<string>('car');
  const [vBrands, setVBrands] = useState<any[]>([]);
  const [vModels, setVModels] = useState<any[]>([]);
  const [vVariants, setVVariants] = useState<any[]>([]);
  const [selBrand, setSelBrand] = useState<string>('');
  const [selModel, setSelModel] = useState<string>('');
  const [selVariant, setSelVariant] = useState<string>('');
  const [selYear, setSelYear] = useState<string>('2022');
  const [vehNickname, setVehNickname] = useState<string>('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const [ordersRes, addrRes]: any[] = await Promise.all([
          api.get('/orders/user'),
          api.get('/addresses'),
        ]);
        if (ordersRes.success) setOrders(ordersRes.orders || []);
        if (addrRes.success) setAddresses(addrRes.addresses || []);
      } catch (err) {
        console.warn('Error fetching account data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [token]);

  useEffect(() => {
    if (showAddVehicle) {
      api.get('/vehicles/brands', { params: { type: vType } })
        .then((res: any) => { if (res.success) setVBrands(res.brands || []); })
        .catch(console.warn);
      setSelBrand('');
      setSelModel('');
      setSelVariant('');
    }
  }, [showAddVehicle, vType]);

  useEffect(() => {
    if (selBrand) {
      api.get('/vehicles/models', { params: { brand_id: selBrand } })
        .then((res: any) => { if (res.success) setVModels(res.models || []); })
        .catch(console.warn);
    } else {
      setVModels([]);
    }
    setSelModel('');
    setSelVariant('');
  }, [selBrand]);

  useEffect(() => {
    if (selModel) {
      api.get('/vehicles/variants', { params: { model_id: selModel } })
        .then((res: any) => { if (res.success) setVVariants(res.variants || []); })
        .catch(console.warn);
    } else {
      setVVariants([]);
    }
    setSelVariant('');
  }, [selModel]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selVariant) {
      showError('Please select a vehicle variant');
      return;
    }
    try {
      await saveToGarage(selVariant, parseInt(selYear, 10), vehNickname, true);
      showSuccess('Vehicle successfully added to your Garage!');
      setShowAddVehicle(false);
    } catch (err) {
      showError('Failed to save vehicle');
    }
  };

  const handleActivateVehicle = (veh: any) => {
    const payload: ActiveVehicleData = {
      type: veh.vehicle_type_id,
      brandId: veh.brand_id,
      brandName: veh.brand_name,
      modelId: veh.model_id,
      modelName: veh.model_name,
      variantId: veh.vehicle_variant_id,
      variantName: veh.variant_name,
      year: veh.year,
      fuelType: veh.fuel_type,
      engineCapacity: veh.engine_capacity,
    };
    setActiveVehicle(payload);
    showSuccess(`Active filter set to ${veh.brand_name} ${veh.model_name}`);
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
    { id: 'garage', label: 'My Garage', icon: Wrench, count: garageVehicles.length },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: 'My Account' }]} />

      {/* Account Profile Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-card mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-red-600/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
              <span>{user?.name || 'Automobile Customer'}</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                {user?.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold border border-slate-200 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 sm:mb-8 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-red-600 text-red-600 bg-red-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS */}
      {currentTab === 'orders' && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-600">Order ID</span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">#{order.order_number}</h3>
                    <p className="text-[11px] text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {order.payment_status}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                      {(order.status || '').replace(/_/g, ' ')}
                    </span>
                    <Link
                      to={`/orders/${order.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors ml-2 shadow-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <p className="text-slate-600">
                    Total Amount: <span className="text-slate-900 font-extrabold text-sm">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Shipping to: {order.shipping_address?.city || 'India'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Orders Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">You haven't placed any spare parts orders yet.</p>
              <Link to="/products" className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm">
                Shop Catalog
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY GARAGE */}
      {currentTab === 'garage' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-display">Saved Vehicles</h2>
              <p className="text-xs text-slate-500">Easily find matching parts with 1-click filter activation</p>
            </div>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {garageVehicles.map((veh: any) => {
              const isActive = activeVehicle?.variantId === veh.vehicle_variant_id;
              return (
                <div
                  key={veh.id}
                  className={`p-5 rounded-3xl bg-white border transition-all shadow-card ${
                    isActive ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-2xl bg-red-50 text-red-600">
                      {veh.vehicle_type_id === 'car' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                    </div>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-600 text-white">
                        Active Filter
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{veh.brand_name} {veh.model_name}</h3>
                  <p className="text-xs text-slate-500">{veh.variant_name} ({veh.year})</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{veh.fuel_type || 'Petrol/Diesel'}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleActivateVehicle(veh)}
                      className={`text-xs font-bold ${
                        isActive ? 'text-red-600' : 'text-slate-700 hover:text-red-600'
                      }`}
                    >
                      {isActive ? 'Active for Fitment' : 'Set as Active →'}
                    </button>
                    <Link
                      to={`/products?vehicle_variant_id=${veh.vehicle_variant_id}&year=${veh.year}&type=${veh.vehicle_type_id}`}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Browse Spares
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ADDRESSES */}
      {currentTab === 'addresses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900">{addr.full_name}</h4>
                  {addr.is_default && (
                    <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.address_line1 || (addr as any).address_line_1}
                  {(addr.address_line2 || (addr as any).address_line_2) ? `, ${addr.address_line2 || (addr as any).address_line_2}` : ''}
                  <br />
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-2">📞 {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {currentTab === 'profile' && (
        <div className="max-w-xl p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Details</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Full Name</span>
              <p className="text-slate-900 font-bold text-sm">{user?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Email Address</span>
              <p className="text-slate-900 font-bold text-sm">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Mobile Phone</span>
              <p className="text-slate-900 font-bold text-sm">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setShowAddVehicle(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-4">Add Vehicle to Garage</h3>
            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVType('car')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    vType === 'car' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Car
                </button>
                <button
                  type="button"
                  onClick={() => setVType('bike')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    vType === 'bike' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Bike
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                <select
                  value={selBrand}
                  onChange={(e) => setSelBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                >
                  <option value="">Select Brand...</option>
                  {vBrands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                <select
                  value={selModel}
                  onChange={(e) => setSelModel(e.target.value)}
                  disabled={!selBrand}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                >
                  <option value="">Select Model...</option>
                  {vModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Variant</label>
                <select
                  value={selVariant}
                  onChange={(e) => setSelVariant(e.target.value)}
                  disabled={!selModel}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                >
                  <option value="">Select Variant...</option>
                  {vVariants.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selVariant}
                className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-xs shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                Save Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
