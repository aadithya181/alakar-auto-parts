import React, { useState, useEffect } from 'react';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminCompatibility: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [vehicleType, setVehicleType] = useState<string>('car');
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const [selBrand, setSelBrand] = useState<string>('');
  const [selModel, setSelModel] = useState<string>('');
  const [selVariant, setSelVariant] = useState<string>('');
  const [yearFrom, setYearFrom] = useState<string>('2018');
  const [yearTo, setYearTo] = useState<string>('2024');
  const [notes, setNotes] = useState<string>('Direct OEM Bolt-on Replacement');

  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [pRes, bRes]: any[] = await Promise.all([
          api.get('/admin/products'),
          api.get('/vehicles/brands', { params: { type: vehicleType } }),
        ]);
        if (pRes.success) {
          setProducts(pRes.products || []);
          if (pRes.products?.[0]) {
            setSelectedProductId(pRes.products[0].id);
          }
        }
        if (bRes.success) setBrands(bRes.brands || []);
      } catch (err) {
        console.error('Compatibility data fetch error:', err);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      api.get(`/products/${selectedProductId}`)
        .then((res: any) => {
          if (res.success) setSelectedProduct(res.product);
        })
        .catch(console.warn);
    }
  }, [selectedProductId]);

  useEffect(() => {
    api.get('/vehicles/brands', { params: { type: vehicleType } })
      .then((res: any) => {
        if (res.success) setBrands(res.brands || []);
      })
      .catch(console.warn);
    setSelBrand('');
    setSelModel('');
    setSelVariant('');
  }, [vehicleType]);

  useEffect(() => {
    if (selBrand) {
      api.get('/vehicles/models', { params: { brand_id: selBrand } })
        .then((res: any) => {
          if (res.success) setModels(res.models || []);
        })
        .catch(console.warn);
    } else {
      setModels([]);
    }
    setSelModel('');
    setSelVariant('');
  }, [selBrand]);

  useEffect(() => {
    if (selModel) {
      api.get('/vehicles/variants', { params: { model_id: selModel } })
        .then((res: any) => {
          if (res.success) setVariants(res.variants || []);
        })
        .catch(console.warn);
    } else {
      setVariants([]);
    }
    setSelVariant('');
  }, [selModel]);

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selVariant) {
      showError('Please select both a product and a vehicle variant');
      return;
    }

    try {
      setSaving(true);
      await api.post('/admin/compatibility', {
        product_id: selectedProductId,
        vehicle_variant_id: selVariant,
        year_from: parseInt(yearFrom, 10) || null,
        year_to: parseInt(yearTo, 10) || null,
        notes,
      });
      showSuccess('Vehicle fitment mapped successfully!');
      const res: any = await api.get(`/products/${selectedProductId}`);
      if (res.success) setSelectedProduct(res.product);
    } catch (err: any) {
      showError(err.message || 'Failed to link compatibility');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    try {
      await api.delete(`/admin/compatibility/${mappingId}`);
      showSuccess('Fitment mapping removed');
      const res: any = await api.get(`/products/${selectedProductId}`);
      if (res.success) setSelectedProduct(res.product);
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Product-to-Vehicle Compatibility Mapper
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Map individual automotive parts to exact vehicle variants, engine configurations, and manufacturing year spans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Product Selector & Link Form (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Step 1: Select Product */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-black">1</span>
              <span>Select Part / Component</span>
            </h3>

            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand_name} • {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Vehicle & Years */}
          <form onSubmit={handleAddMapping} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-black">2</span>
              <span>Connect Compatible Vehicle</span>
            </h3>

            {/* Car/Bike Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  vehicleType === 'car' ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Car
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('bike')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  vehicleType === 'bike' ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Bike
              </button>
            </div>

            {/* Brand, Model, Variant */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Brand</label>
                <select
                  value={selBrand}
                  onChange={(e) => setSelBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                >
                  <option value="">Select Brand...</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Model</label>
                <select
                  value={selModel}
                  onChange={(e) => setSelModel(e.target.value)}
                  disabled={!selBrand}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 disabled:opacity-50"
                >
                  <option value="">Select Model...</option>
                  {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Variant & Generation</label>
                <select
                  value={selVariant}
                  onChange={(e) => setSelVariant(e.target.value)}
                  disabled={!selModel}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 disabled:opacity-50"
                >
                  <option value="">Select Variant...</option>
                  {variants.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.year_start || v.year_from}+)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Year From</label>
                  <input
                    type="number"
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Year To</label>
                  <input
                    type="number"
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Fitment Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Direct OEM Bolt-on Replacement"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !selVariant}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <LinkIcon className="w-4 h-4" />
              <span>{saving ? 'Linking Fitment...' : 'Link Compatibility Mapping'}</span>
            </button>
          </form>
        </div>

        {/* Right: Active Mappings for Selected Product (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Currently Verified Fitments for Selected Part
            </h3>
            {selectedProduct?.compatibility?.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {selectedProduct.compatibility.map((fit: any) => (
                  <div
                    key={fit.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {fit.brand_name} {fit.model_name}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {fit.variant_name} ({fit.year_start || fit.year_from}{(fit.year_end || fit.year_to) ? `–${fit.year_end || fit.year_to}` : '+'})
                      </p>
                      {fit.notes && (
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold mt-1 inline-block">{fit.notes}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMapping(fit.id)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                No custom vehicle mappings linked yet. Use the form on the left to connect vehicle models.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
