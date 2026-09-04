import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, Upload, Check, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Product, Category, Brand } from '../../types';

const SHOP_GALLERY_IMAGES = [
  { label: '5M Windtone Horn Box', url: '/images/products/5m-windtone-horn-box.jpeg' },
  { label: '5M 3-Pipe Horn Poster', url: '/images/products/5m-3pipe-horn-poster.jpeg' },
  { label: '5M 3-Pipe Horn Pack', url: '/images/products/5m-3pipe-horn-pack.jpeg' },
  { label: '5M Single Horn Box', url: '/images/products/5m-single-horn-box.jpeg' },
  { label: 'WOW SONAL XL Horn Box', url: '/images/products/wow-sonal-xl-horn-box.jpeg' },
  { label: 'WOW SONAL XL Horn Demo', url: '/images/products/wow-sonal-xl-horn-demo.jpeg' },
  { label: '5M Mini Drive Light Box', url: '/images/products/5m-mini-drive-light-box.jpeg' },
  { label: '5M Mini Drive Light Demo', url: '/images/products/5m-mini-drive-light-demo.jpeg' },
  { label: 'LIU HJG 9-LED Spotlight Box', url: '/images/products/liu-hjg-9led-light-box.jpeg' },
  { label: 'LIU HJG 9-LED Spotlight Demo', url: '/images/products/liu-hjg-9led-light-demo.jpeg' },
  { label: 'Strip COB LED Light Box', url: '/images/products/flexible-strip-cob-box.jpeg' },
  { label: 'Strip COB Glowing Neon', url: '/images/products/flexible-strip-cob-glowing.jpeg' },
  { label: 'ProTaper Handlebar Grips', url: '/images/products/protaper-handle-grips-colors.jpeg' },
  { label: 'ProTaper Grips (Blue)', url: '/images/products/protaper-handle-grip-blue.jpeg' },
  { label: 'Registration Number Plate Frames', url: '/images/products/number-plate-frame-set.jpeg' },
];

export const AdminProducts: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageTab, setImageTab] = useState<'upload' | 'gallery' | 'url'>('gallery');

  const [formData, setFormData] = useState<any>({
    name: '',
    sku: '',
    oem_number: '',
    category_id: '',
    brand_id: '',
    short_description: '',
    description: '',
    mrp: '',
    selling_price: '',
    cost_price: '',
    gst_percentage: '18',
    stock_quantity: '',
    low_stock_threshold: '5',
    weight: '1.0',
    warranty: '1 Year Warranty',
    image_url: '',
    status: 'active',
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes]: any[] = await Promise.all([
        api.get('/admin/products'),
        api.get('/categories'),
        api.get('/brands'),
      ]);
      if (prodRes.success) setProducts(prodRes.products || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (brandRes.success) setBrands(brandRes.brands || []);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: 'SKU-' + Math.floor(10000 + Math.random() * 90000),
      oem_number: '',
      category_id: categories[0]?.id || '',
      brand_id: brands[0]?.id || '',
      short_description: '',
      description: '',
      mrp: '',
      selling_price: '',
      cost_price: '',
      gst_percentage: '18',
      stock_quantity: '25',
      low_stock_threshold: '5',
      weight: '1.0',
      warranty: '1 Year Warranty',
      image_url: SHOP_GALLERY_IMAGES[0].url,
      status: 'active',
      is_featured: false,
      is_bestseller: false,
      is_new_arrival: true,
    });
    setImageTab('gallery');
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      oem_number: p.oem_number || '',
      category_id: p.category_id || (categories[0]?.id || ''),
      brand_id: p.brand_id || (brands[0]?.id || ''),
      short_description: p.short_description || '',
      description: p.description || '',
      mrp: p.mrp,
      selling_price: p.selling_price,
      cost_price: p.cost_price || '',
      gst_percentage: p.gst_percentage || '18',
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold || '5',
      weight: p.weight || '1.0',
      warranty: p.warranty || '1 Year Warranty',
      image_url: p.primary_image || (p.images && p.images[0]?.image_url) || '',
      status: p.status || 'active',
      is_featured: Boolean(p.is_featured),
      is_bestseller: Boolean(p.is_bestseller),
      is_new_arrival: Boolean(p.is_new_arrival),
    });
    setImageTab('gallery');
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, image_url: reader.result as string }));
        showSuccess('Image uploaded and preview updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.selling_price) {
      showError('Please enter product name, SKU and selling price');
      return;
    }

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, formData);
        showSuccess(`"${formData.name}" updated successfully!`);
      } else {
        await api.post('/admin/products', formData);
        showSuccess(`"${formData.name}" added to store catalog!`);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the store?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showSuccess(`"${name}" removed from inventory and customer catalog`);
      fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand_name && p.brand_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Product Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage spare parts catalog, pricing, OEM barcodes, stock quantities, and product photos in real-time.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-red-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search Input & Total Count */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search products by SKU, title or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-bold text-slate-500 shrink-0">
          Showing {filteredProducts.length} live products
        </span>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Product Details</th>
                <th className="p-4">SKU / OEM</th>
                <th className="p-4">Category</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const img = p.primary_image || (p.images && p.images[0]?.image_url) || '/images/products/5m-single-horn-box.jpeg';
                const isActive = (p as any).status !== 'inactive';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="truncate max-w-xs sm:max-w-sm">
                          <span className="font-bold text-slate-900 truncate block text-xs">{p.name}</span>
                          <span className="text-[10px] text-red-600 font-black uppercase tracking-wider">{p.brand_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-600 font-semibold">
                      {p.sku}
                      {p.oem_number && <span className="block text-[10px] text-slate-400 font-normal">OE: {p.oem_number}</span>}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {p.category_name || 'General'}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      ₹{Number(p.selling_price).toLocaleString('en-IN')}
                      {p.mrp > p.selling_price && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          MRP ₹{Number(p.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        p.stock_quantity <= 5
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {p.stock_quantity} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product Details & Price"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Remove Product"
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-5">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Spare Part to Inventory'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SKU Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Row 2: Category, Brand, OEM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand</label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">OEM Part Number</label>
                  <input
                    type="text"
                    value={formData.oem_number}
                    onChange={(e) => setFormData({ ...formData, oem_number: e.target.value })}
                    placeholder="e.g. 5M-HRN-603"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Row 3: Pricing & Quantities */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-red-50/40 border border-red-100">
                <div>
                  <label className="block text-xs font-black text-red-700 uppercase mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Catalog Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Product Image Selector & Device Upload */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-red-600" />
                    Product Photo Selection
                  </label>
                  <div className="flex p-0.5 rounded-lg bg-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageTab('gallery')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        imageTab === 'gallery' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Shop Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        imageTab === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Upload from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        imageTab === 'url' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Custom Path
                    </button>
                  </div>
                </div>

                {/* Tab A: Shop Photos Gallery */}
                {imageTab === 'gallery' && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {SHOP_GALLERY_IMAGES.map((img) => {
                      const isSelected = formData.image_url === img.url;
                      return (
                        <div
                          key={img.url}
                          onClick={() => setFormData({ ...formData, image_url: img.url })}
                          className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square ${
                            isSelected ? 'border-red-600 ring-2 ring-red-600/30' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] truncate px-1 py-0.5 text-center">
                            {img.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab B: Upload from Device */}
                {imageTab === 'upload' && (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:border-red-500 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                    >
                      Choose Photo from Device
                    </button>
                    <p className="text-[11px] text-slate-400 mt-2">
                      JPG, PNG, WebP up to 5MB. Will automatically display in your store.
                    </p>
                  </div>
                )}

                {/* Tab C: Direct Path Input */}
                {imageTab === 'url' && (
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/images/products/... or data:image/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                )}

                {/* Live Preview */}
                {formData.image_url && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-300 shadow-sm"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Active Selected Image</span>
                      <span className="text-[11px] text-slate-400 font-mono truncate block max-w-sm">
                        {formData.image_url.slice(0, 50)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 5: Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details, fitment specifications, wattage, tone..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save & Update in Store' : 'Add to Store Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
