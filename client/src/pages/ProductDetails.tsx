import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Star,
  Check
} from 'lucide-react';
import { RatingStars } from '../components/RatingStars';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useVehicle } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Product } from '../types';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { activeVehicle } = useVehicle();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();

  const [product, setProduct] = useState<Product | any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('description');
  const [loading, setLoading] = useState<boolean>(true);
  const [added, setAdded] = useState<boolean>(false);

  // Fitment verification interactive widget state
  const [customBrand, setCustomBrand] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('');
  const [customVariant, setCustomVariant] = useState<string>('');
  const [customYear, setCustomYear] = useState<string>('');
  const [fitResult, setFitResult] = useState<any>(null);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [variantsList, setVariantsList] = useState<any[]>([]);

  // Review Form
  const [newRating, setNewRating] = useState<number>(5);
  const [newReview, setNewReview] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/products/${slug}`);
        if (res.success && res.product) {
          setProduct(res.product);
          const firstImg = res.product.images?.[0]?.image_url || res.product.primary_image;
          setSelectedImage(firstImg);

          const bRes: any = await api.get('/vehicles/brands', { params: { type: res.product.vehicle_type } });
          if (bRes.success) setBrandsList(bRes.brands || []);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Check fitment automatically if user already has an active vehicle
  useEffect(() => {
    if (activeVehicle && product?.id) {
      api.get('/products/check-compatibility', {
        params: {
          product_id: product.id,
          vehicle_variant_id: activeVehicle.variantId,
          year: activeVehicle.year,
        },
      })
        .then((res: any) => {
          if (res.success) setFitResult(res);
        })
        .catch(console.warn);
    }
  }, [activeVehicle, product]);

  // Cascading Models
  useEffect(() => {
    if (customBrand) {
      api.get('/vehicles/models', { params: { brand_id: customBrand } })
        .then((res: any) => {
          if (res.success) setModelsList(res.models || []);
        })
        .catch(console.warn);
    } else {
      setModelsList([]);
    }
    setCustomModel('');
    setCustomVariant('');
  }, [customBrand]);

  // Cascading Variants
  useEffect(() => {
    if (customModel) {
      api.get('/vehicles/variants', { params: { model_id: customModel } })
        .then((res: any) => {
          if (res.success) setVariantsList(res.variants || []);
        })
        .catch(console.warn);
    } else {
      setVariantsList([]);
    }
    setCustomVariant('');
  }, [customModel]);

  const handleManualCheckFit = async () => {
    if (!customVariant) return;
    try {
      const res: any = await api.get('/products/check-compatibility', {
        params: {
          product_id: product.id,
          vehicle_variant_id: customVariant,
          year: customYear || null,
        },
      });
      if (res.success) {
        setFitResult(res);
      }
    } catch (err) {
      console.warn('Manual fit check error:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    showSuccess(`Added ${quantity}x "${product.name}" to cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showError('Please sign in to submit a review');
      navigate('/login');
      return;
    }
    if (!newReview.trim()) {
      showError('Please enter review comments');
      return;
    }

    try {
      setSubmittingReview(true);
      const res: any = await api.post('/reviews', {
        product_id: product.id,
        rating: newRating,
        review: newReview.trim(),
      });
      if (res.success) {
        showSuccess('Thank you! Your verified review has been submitted.');
        setNewReview('');
        const prodRes: any = await api.get(`/products/${slug}`);
        if (prodRes.success) setProduct(prodRes.product);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-[4/3] bg-slate-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/4" />
            <div className="h-8 bg-slate-100 rounded w-3/4" />
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-32 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested spare part could not be located in our catalog.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md">
          Browse All Products
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const mrp = Number(product.mrp) || Number(product.selling_price) || 0;
  const sellingPrice = Number(product.selling_price) || 0;
  const discount = product.discount_percentage || (mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: product.category_name || 'Category', href: `/products?category_slug=${product.category_slug}` },
          { label: product.name },
        ]}
      />

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mb-12">
        {/* Left: Gallery (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-card flex items-center justify-center p-4">
            <img
              src={selectedImage || product.primary_image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600'}
              alt={product.name}
              className="max-h-full max-w-full object-contain rounded-2xl transition-all duration-300"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                {discount}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-sm transition-colors ${
                inWishlist
                  ? 'bg-red-600 text-white shadow-red-600/30'
                  : 'bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white shrink-0 ${
                    selectedImage === img.image_url ? 'border-red-600 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}

          {/* Key Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">100% Genuine</p>
              <p className="text-[10px] text-slate-500">OE Certified</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <Truck className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">Free Delivery</p>
              <p className="text-[10px] text-slate-500">Orders above ₹999</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <RotateCcw className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">7-Day Returns</p>
              <p className="text-[10px] text-slate-500">Fitment Guarantee</p>
            </div>
          </div>
        </div>

        {/* Right: Details & Purchase Actions (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            {/* Brand & SKU Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold uppercase tracking-wide text-red-600">
                  {product.brand_name || 'Genuine OEM'}
                </span>
                {product.brand_logo_url && (
                  <img src={product.brand_logo_url} alt="" className="h-4 object-contain" />
                )}
              </div>
              <span className="text-xs font-mono text-slate-400">
                SKU: {product.sku} {product.oem_number ? `• OE: ${product.oem_number}` : ''}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-slate-900 tracking-tight leading-snug mb-3">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-3 mb-4">
              <RatingStars
                rating={product.avg_rating || product.rating_avg || 4.8}
                totalReviews={product.total_reviews || product.rating_count}
                size="md"
              />
              <span className="text-xs text-slate-500">• Verified Automotive Purchase</span>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through">
                      MRP ₹{mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                      Save ₹{(mrp - sellingPrice).toLocaleString('en-IN')} ({discount}%)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inclusive of GST ({product.gst_percentage || 18}%). Free shipping applied on checkout.
              </p>
            </div>

            {/* FITMENT CHECKER WIDGET */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Will This Part Fit My Vehicle?
                </h3>
              </div>

              {/* Fitment Result Status Notice */}
              {fitResult && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2.5 border ${
                    fitResult.isCompatible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {fitResult.isCompatible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <span>{fitResult.message}</span>
                </div>
              )}

              {/* Vehicle Compatibility Dropdown Checker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                <select
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Select Brand...</option>
                  {brandsList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <select
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  disabled={!customBrand}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                >
                  <option value="">Select Model...</option>
                  {modelsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <select
                  value={customVariant}
                  onChange={(e) => setCustomVariant(e.target.value)}
                  disabled={!customModel}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                >
                  <option value="">Select Variant...</option>
                  {variantsList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.year_start || v.year_from || 'All'}+)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleManualCheckFit}
                disabled={!customVariant}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors disabled:opacity-40 shadow-sm"
              >
                Check Compatibility Now
              </button>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {product.short_description || product.description}
            </p>
          </div>

          {/* Action Row (Quantity + Add to Cart + Buy Now) */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Quantity Modifier */}
              <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 font-bold text-sm shadow-sm"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 font-bold text-sm shadow-sm"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className={`flex-1 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  product.stock_quantity <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              {product.stock_quantity > 0 ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({product.stock_quantity} units ready to ship)
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  Currently Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="mt-12">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
          {[
            { id: 'description', label: 'Full Description' },
            { id: 'specs', label: 'Technical Specifications' },
            { id: 'compatibility', label: `Compatible Vehicles (${product.compatibility?.length || 0})` },
            { id: 'reviews', label: `Customer Reviews (${product.reviews?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600 bg-red-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="py-6 sm:py-8 space-y-6 max-w-4xl text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card">
              <h3 className="text-base font-bold text-slate-900 mb-3">Product Overview</h3>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2">Warranty & Protection</h4>
                <p className="text-slate-500">{product.warranty || '1 Year Manufacturer Warranty against manufacturing defects'}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2">Return Policy</h4>
                <p className="text-slate-500">7-Day replacement if the part does not fit your selected vehicle as described.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className="py-6 sm:py-8 max-w-3xl">
            <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card">
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-3 p-4 text-xs">
                  <span className="font-bold text-slate-500">Manufacturer Brand</span>
                  <span className="col-span-2 text-slate-900 font-semibold">{product.brand_name}</span>
                </div>
                <div className="grid grid-cols-3 p-4 text-xs">
                  <span className="font-bold text-slate-500">Part SKU Number</span>
                  <span className="col-span-2 text-slate-900 font-mono">{product.sku}</span>
                </div>
                {product.oem_number && (
                  <div className="grid grid-cols-3 p-4 text-xs">
                    <span className="font-bold text-slate-500">OEM Part Number</span>
                    <span className="col-span-2 text-slate-900 font-mono">{product.oem_number}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 p-4 text-xs">
                  <span className="font-bold text-slate-500">Weight</span>
                  <span className="col-span-2 text-slate-900">{product.weight ? `${product.weight} kg` : 'Standard'}</span>
                </div>
                {product.specifications && Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 p-4 text-xs">
                    <span className="font-bold text-slate-500">{k}</span>
                    <span className="col-span-2 text-slate-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Compatible Vehicles */}
        {activeTab === 'compatibility' && (
          <div className="py-6 sm:py-8">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Verified Compatible Models</h3>
              <p className="text-xs text-slate-500">This part is verified for the following automotive applications:</p>
            </div>

            {product.compatibility && product.compatibility.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.compatibility.map((fit: any) => (
                  <div
                    key={fit.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm"
                  >
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {fit.brand_name} {fit.model_name}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {fit.variant_name} ({fit.year_start || fit.year_from || 'All'} - {fit.year_end || fit.year_to || 'Present'})
                      </p>
                      {fit.engine_capacity && (
                        <p className="text-[10px] text-slate-400">{fit.engine_capacity} • {fit.fuel_type}</p>
                      )}
                      {fit.notes && (
                        <span className="inline-block mt-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                          {fit.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Universal fitment for standard automotive specifications.</p>
            )}
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reviews List (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Customer Reviews</h3>
                <span className="text-xs text-slate-500">Average Rating: {product.avg_rating || product.rating_avg || 4.8} / 5.0</span>
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev: any) => (
                  <div key={rev.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{rev.user_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <RatingStars rating={rev.rating} size="sm" showScore={false} />
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.review || rev.review_text}</p>
                    {rev.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No reviews yet. Be the first to review this product!</p>
              )}
            </div>

            {/* Write a Review (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-card self-start">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Write a Customer Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Feedback</label>
                  <textarea
                    rows={4}
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Share how this spare part performed with your vehicle..."
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Quick Buy Bar (Floating above mobile bottom nav) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-base font-black text-slate-900">
            ₹{sellingPrice.toLocaleString('en-IN')}
          </span>
          {mrp > sellingPrice && (
            <span className="text-xs text-slate-400 line-through block -mt-1">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[220px]">
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm"
          >
            {added ? 'Added' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock_quantity <= 0}
            className="py-2.5 px-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-black"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};
