import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike, Truck, Zap, Search, ChevronRight, Bookmark } from 'lucide-react';
import api from '../services/api';
import { useVehicle, ActiveVehicleData } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface VehicleSelectorProps {
  compact?: boolean;
  onSelectComplete?: (vehicle: ActiveVehicleData) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  compact = false,
  onSelectComplete,
}) => {
  const navigate = useNavigate();
  const { activeVehicle, setActiveVehicle, garageVehicles } = useVehicle();
  const { user } = useAuth();
  const { showSuccess } = useToast();

  const [vehicleType, setVehicleType] = useState<string>(activeVehicle?.type || 'car');
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<string>(activeVehicle?.brandId || '');
  const [selectedModel, setSelectedModel] = useState<string>(activeVehicle?.modelId || '');
  const [selectedYear, setSelectedYear] = useState<number | string>(activeVehicle?.year || '');
  const [selectedVariant, setSelectedVariant] = useState<string>(activeVehicle?.variantId || '');

  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false);

  // Fetch Brands when vehicleType changes
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const res: any = await api.get('/vehicles/brands', { params: { type: vehicleType } });
        if (res.success) {
          setBrands(res.brands || []);
        }
      } catch (err) {
        console.error('Failed to load vehicle brands:', err);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
    if (activeVehicle?.type !== vehicleType) {
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedYear('');
      setSelectedVariant('');
      setModels([]);
      setVariants([]);
    }
  }, [vehicleType]);

  // Fetch Models when selectedBrand changes
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel('');
      setSelectedVariant('');
      return;
    }

    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const res: any = await api.get('/vehicles/models', { params: { brand_id: selectedBrand } });
        if (res.success) {
          setModels(res.models || []);
        }
      } catch (err) {
        console.error('Failed to load models:', err);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [selectedBrand]);

  // Fetch Variants when selectedModel changes
  useEffect(() => {
    if (!selectedModel) {
      setVariants([]);
      setSelectedVariant('');
      return;
    }

    const fetchVariants = async () => {
      try {
        setLoadingVariants(true);
        const res: any = await api.get('/vehicles/variants', { params: { model_id: selectedModel } });
        if (res.success) {
          setVariants(res.variants || []);
        }
      } catch (err) {
        console.error('Failed to load variants:', err);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [selectedModel]);

  const currentVariantObj = variants.find((v) => v.id === selectedVariant);
  const availableYears: number[] = [];
  if (currentVariantObj) {
    const from = currentVariantObj.year_start || currentVariantObj.year_from || 2018;
    const to = currentVariantObj.year_end || currentVariantObj.year_to || new Date().getFullYear() + 1;
    for (let y = to; y >= from; y--) {
      availableYears.push(y);
    }
  } else {
    for (let y = 2026; y >= 2014; y--) {
      availableYears.push(y);
    }
  }

  const handleFindParts = () => {
    if (!selectedBrand || !selectedModel || !selectedVariant) return;

    const brandObj = brands.find((b) => b.id === selectedBrand);
    const modelObj = models.find((m) => m.id === selectedModel);
    const variantObj = variants.find((v) => v.id === selectedVariant);

    const vehiclePayload: ActiveVehicleData = {
      type: vehicleType,
      brandId: selectedBrand,
      brandName: brandObj ? brandObj.name : '',
      modelId: selectedModel,
      modelName: modelObj ? modelObj.name : '',
      variantId: selectedVariant,
      variantName: variantObj ? variantObj.name : '',
      year: Number(selectedYear) || (variantObj ? variantObj.year_start || 2022 : 2022),
      fuelType: variantObj?.fuel_type || '',
      engineCapacity: variantObj?.engine_capacity || '',
    };

    setActiveVehicle(vehiclePayload);
    showSuccess(`Selected ${vehiclePayload.brandName} ${vehiclePayload.modelName} ${vehiclePayload.variantName}`);

    if (onSelectComplete) {
      onSelectComplete(vehiclePayload);
    } else {
      navigate(`/products?vehicle_variant_id=${selectedVariant}&year=${vehiclePayload.year}&type=${vehicleType}`);
    }
  };

  const handleSelectFromGarage = (veh: any) => {
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
    showSuccess(`Active vehicle set to ${veh.brand_name} ${veh.model_name}`);
    navigate(`/products?vehicle_variant_id=${veh.vehicle_variant_id}&year=${veh.year}&type=${veh.vehicle_type_id}`);
  };

  return (
    <div className={`w-full ${compact ? 'p-4 bg-white rounded-2xl border border-slate-200 shadow-sm' : 'p-5 sm:p-6 md:p-8 rounded-2xl bg-white shadow-card border border-slate-200'}`}>
      {/* Title & Tabs Header */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 font-display tracking-tight">
              Find Exact Fit Parts For Your Vehicle
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your vehicle for 100% genuine compatibility.
            </p>
          </div>

          {/* Vehicle Type Tabs (Bike, Auto, Car, Van) */}
          <div className="grid grid-cols-2 sm:flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start gap-1">
            <button
              type="button"
              onClick={() => setVehicleType('bike')}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                vehicleType === 'bike'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>BIKE</span>
            </button>
            <button
              type="button"
              onClick={() => setVehicleType('auto')}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                vehicleType === 'auto'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>AUTO</span>
            </button>
            <button
              type="button"
              onClick={() => setVehicleType('car')}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                vehicleType === 'car'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>CAR</span>
            </button>
            <button
              type="button"
              onClick={() => setVehicleType('van')}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                vehicleType === 'van'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>VAN / COMM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cascading Dropdowns Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 mb-5">
        {/* 1. Brand */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            1. Select {vehicleType === 'car' ? 'Car' : 'Bike'} Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel('');
              setSelectedVariant('');
            }}
            disabled={loadingBrands}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-colors"
          >
            <option value="">{loadingBrands ? 'Loading Brands...' : 'Choose Brand...'}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Model */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            2. Select Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setSelectedVariant('');
            }}
            disabled={!selectedBrand || loadingModels}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedBrand ? 'Select Brand First' : loadingModels ? 'Loading Models...' : 'Choose Model...'}
            </option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Variant */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            3. Select Variant / Gen
          </label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            disabled={!selectedModel || loadingVariants}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedModel ? 'Select Model First' : loadingVariants ? 'Loading Variants...' : 'Choose Variant...'}
            </option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.year_start || v.year_from || 'All'} - {v.year_end || v.year_to || 'Present'})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Year */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            4. Manufacturing Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedVariant}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select Year...</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CTA Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {garageVehicles.length > 0 && user ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto max-w-md w-full sm:w-auto">
            <span className="font-semibold text-slate-700 flex items-center gap-1 shrink-0">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Saved Garage:
            </span>
            {garageVehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectFromGarage(v)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors shrink-0 ${
                  activeVehicle?.variantId === v.vehicle_variant_id
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {v.brand_name} {v.model_name} ({v.year})
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 hidden sm:block">
            💡 Select your vehicle to view only 100% fitting brake pads, filters, engine components & accessories.
          </div>
        )}

        <button
          type="button"
          onClick={handleFindParts}
          disabled={!selectedBrand || !selectedModel || !selectedVariant}
          className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-auto active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span>Show Compatible Parts</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
