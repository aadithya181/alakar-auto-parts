import React from 'react';
import { Filter, X, Car, Bike, Wrench } from 'lucide-react';
import { useVehicle } from '../context/VehicleContext';
import { Category, Brand } from '../types';

interface PriceRange {
  min: string | number;
  max: string | number;
}

interface FilterSidebarProps {
  categories?: Category[] | any[];
  brands?: Brand[] | any[];
  selectedCategory: string;
  onCategoryChange: (catSlug: string) => void;
  selectedBrand: string;
  onBrandChange: (brandSlug: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  priceRange: PriceRange;
  onPriceChange: (field: 'min' | 'max', value: string) => void;
  inStockOnly: boolean;
  onStockChange: (checked: boolean) => void;
  onResetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories = [],
  brands = [],
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  selectedType,
  onTypeChange,
  priceRange,
  onPriceChange,
  inStockOnly,
  onStockChange,
  onResetFilters,
}) => {
  const { activeVehicle, clearActiveVehicle } = useVehicle();

  return (
    <div className="w-full space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Filters</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Active Vehicle Filter Box */}
      {activeVehicle && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-red-700 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> Vehicle Filter Active
            </span>
            <button
              onClick={clearActiveVehicle}
              title="Remove vehicle filter"
              className="text-slate-400 hover:text-red-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs font-bold text-slate-900">
            {activeVehicle.brandName} {activeVehicle.modelName} ({activeVehicle.year})
          </p>
          <p className="text-[10px] text-slate-600 truncate mt-0.5">
            {activeVehicle.variantName}
          </p>
        </div>
      )}

      {/* Vehicle Type (Car vs Bike) */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Vehicle Type
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onTypeChange('')}
            className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              !selectedType
                ? 'bg-red-600 border-red-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onTypeChange('car')}
            className={`py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
              selectedType === 'car'
                ? 'bg-red-600 border-red-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Car className="w-3 h-3" /> Car
          </button>
          <button
            onClick={() => onTypeChange('bike')}
            className={`py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
              selectedType === 'bike'
                ? 'bg-red-600 border-red-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bike className="w-3 h-3" /> Bike
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Categories
        </h4>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat: any) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(isSelected ? '' : cat.slug)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat.product_count !== undefined && (
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">({cat.product_count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Brands
        </h4>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          {brands.map((brand: any) => {
            const isSelected = selectedBrand === brand.slug;
            return (
              <button
                key={brand.id}
                onClick={() => onBrandChange(isSelected ? '' : brand.slug)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{brand.name}</span>
                {brand.product_count !== undefined && (
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">({brand.product_count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={priceRange.min}
            onChange={(e) => onPriceChange('min', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={priceRange.max}
            onChange={(e) => onPriceChange('max', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* In Stock Only */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onStockChange(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <span>In Stock Items Only</span>
        </label>
      </div>
    </div>
  );
};
