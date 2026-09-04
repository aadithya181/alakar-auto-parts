import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Car, Bike, Wrench, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useVehicle } from '../context/VehicleContext';
import api from '../services/api';
import { Product, Category, Brand } from '../types';

interface ProductsProps {
  defaultType?: string;
}

export const Products: React.FC<ProductsProps> = ({ defaultType }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { activeVehicle, clearActiveVehicle } = useVehicle();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const selectedCategory = searchParams.get('category_slug') || categorySlug || '';
  const selectedBrand = searchParams.get('brand_slug') || '';
  const selectedType = searchParams.get('type') || defaultType || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || '',
  });

  // Fetch filter options (categories & brands)
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [catRes, brandRes]: any[] = await Promise.all([
          api.get('/categories', { params: { vehicle_type: selectedType } }),
          api.get('/brands'),
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (brandRes.success) setBrands(brandRes.brands || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchFilterData();
  }, [selectedType]);

  // Fetch Products based on all active query params & vehicle context
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          limit: 12,
          sort_by: sortBy,
        };

        if (selectedCategory) params.category_slug = selectedCategory;
        if (selectedBrand) params.brand_slug = selectedBrand;
        if (selectedType) params.vehicle_type = selectedType;
        if (searchQuery) params.search = searchQuery;
        if (inStockOnly) params.in_stock = true;
        if (priceRange.min) params.min_price = priceRange.min;
        if (priceRange.max) params.max_price = priceRange.max;

        const variantId = searchParams.get('vehicle_variant_id') || activeVehicle?.variantId;
        const year = searchParams.get('year') || activeVehicle?.year;
        if (variantId) {
          params.vehicle_variant_id = variantId;
          if (year) params.year = year;
        }

        const res: any = await api.get('/products', { params });
        if (res.success) {
          setProducts(res.products || []);
          setPagination(res.pagination || { page: 1, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Error loading products catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, categorySlug, activeVehicle, currentPage, sortBy]);

  const updateQueryParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handlePriceChange = (field: 'min' | 'max', val: string) => {
    setPriceRange((prev) => ({ ...prev, [field]: val }));
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(`${field}_price`, val);
    } else {
      newParams.delete(`${field}_price`);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setPriceRange({ min: '', max: '' });
    clearActiveVehicle();
    setSearchParams({});
  };

  const pageTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
    : selectedType === 'car'
    ? 'Car Spare Parts & Accessories'
    : selectedType === 'bike'
    ? 'Motorcycle Spare Parts & Accessories'
    : 'All Automotive Spare Parts';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          ...(selectedType ? [{ label: selectedType === 'car' ? 'Car Parts' : 'Bike Parts', href: `/${selectedType}-parts` }] : []),
          ...(selectedCategory ? [{ label: pageTitle }] : []),
        ]}
      />

      {/* Header Banner */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Showing {pagination.total} guaranteed genuine automotive components
        </p>

        {/* Active Vehicle Fitment Notice Banner */}
        {activeVehicle && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-600">
                {activeVehicle.type === 'car' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Showing parts compatible with {activeVehicle.brandName} {activeVehicle.modelName} ({activeVehicle.year})
                </p>
                <p className="text-[11px] text-slate-600">
                  Variant: {activeVehicle.variantName} {activeVehicle.fuelType ? `• ${activeVehicle.fuelType}` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={clearActiveVehicle}
              className="text-xs font-bold text-slate-700 hover:text-red-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shrink-0 shadow-sm"
            >
              <X className="w-3.5 h-3.5" /> Clear Vehicle Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-card self-start sticky top-24">
          <FilterSidebar
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            onCategoryChange={(slug) => updateQueryParam('category_slug', slug)}
            selectedBrand={selectedBrand}
            onBrandChange={(slug) => updateQueryParam('brand_slug', slug)}
            selectedType={selectedType}
            onTypeChange={(type) => updateQueryParam('type', type)}
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
            inStockOnly={inStockOnly}
            onStockChange={(checked) => updateQueryParam('in_stock', checked ? 'true' : '')}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {/* Controls Bar (Mobile Filter trigger + Sorting) */}
          <div className="flex items-center justify-between gap-3 p-3.5 mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <span className="text-xs text-slate-500 hidden sm:inline">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="sort_select" className="text-xs font-bold text-slate-700 uppercase tracking-wider hidden sm:inline">
                Sort By:
              </label>
              <select
                id="sort_select"
                value={sortBy}
                onChange={(e) => updateQueryParam('sort_by', e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
              >
                <option value="relevance">Relevance</option>
                <option value="bestseller">Popularity & Bestsellers</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 shadow-sm">
                  <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="h-6 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm my-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Compatible Parts Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                We couldn't find any products matching your specific filters or vehicle model. Try adjusting your search or clearing vehicle filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
              <button
                onClick={() => updateQueryParam('page', String(Math.max(1, currentPage - 1)))}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pNum = idx + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => updateQueryParam('page', String(pNum))}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors shadow-sm ${
                      currentPage === pNum
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => updateQueryParam('page', String(Math.min(pagination.totalPages, currentPage + 1)))}
                disabled={currentPage >= pagination.totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-0 bottom-0 right-0 w-4/5 max-w-sm bg-white border-l border-slate-200 p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              onCategoryChange={(slug) => {
                updateQueryParam('category_slug', slug);
                setMobileFilterOpen(false);
              }}
              selectedBrand={selectedBrand}
              onBrandChange={(slug) => {
                updateQueryParam('brand_slug', slug);
                setMobileFilterOpen(false);
              }}
              selectedType={selectedType}
              onTypeChange={(type) => {
                updateQueryParam('type', type);
                setMobileFilterOpen(false);
              }}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              inStockOnly={inStockOnly}
              onStockChange={(checked) => updateQueryParam('in_stock', checked ? 'true' : '')}
              onResetFilters={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
