import React, { useState, useEffect } from 'react';
import { Car, Bike, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export const AdminVehicles: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<string>('car');
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res: any = await api.get('/vehicles/brands', { params: { type: vehicleType } });
        if (res.success) {
          setBrands(res.brands || []);
          if (res.brands?.[0]) setSelectedBrand(res.brands[0].id);
        }
      } catch (err) {
        console.warn(err);
      }
    };
    fetchBrands();
  }, [vehicleType]);

  useEffect(() => {
    if (selectedBrand) {
      api.get('/vehicles/models', { params: { brand_id: selectedBrand } })
        .then((res: any) => {
          if (res.success) {
            setModels(res.models || []);
            if (res.models?.[0]) setSelectedModel(res.models[0].id);
          }
        })
        .catch(console.warn);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedModel) {
      api.get('/vehicles/variants', { params: { model_id: selectedModel } })
        .then((res: any) => {
          if (res.success) setVariants(res.variants || []);
        })
        .catch(console.warn);
    }
  }, [selectedModel]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Vehicle Database Hierarchy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage Car & Bike OEM brands, vehicle models, engine capacities and generation variants.
        </p>
      </div>

      {/* Car/Bike Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setVehicleType('car')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
            vehicleType === 'car' ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Car Brands & Models</span>
        </button>
        <button
          onClick={() => setVehicleType('bike')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
            vehicleType === 'bike' ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Bike Brands & Models</span>
        </button>
      </div>

      {/* 3 Column Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: Brands */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Vehicle Brands</h3>
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBrand(b.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  selectedBrand === b.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{b.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Col 2: Models */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Models</h3>
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  selectedModel === m.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{m.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Col 3: Variants */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Generation Variants</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {variants.map((v) => (
              <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900">{v.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Years: {v.year_start || v.year_from}{(v.year_end || v.year_to) ? `–${v.year_end || v.year_to}` : '+'}
                </p>
                {v.engine_capacity && (
                  <p className="text-[10px] text-red-600 font-semibold">{v.engine_capacity} • {v.fuel_type}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
