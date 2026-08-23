const { supabase } = require('../config/supabase');

class SupabaseService {
  // ==================== VEHICLES ====================
  async getVehicleTypes() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('vehicle_types').select('*');
    if (error) throw error;
    return data;
  }

  async getBrands(vehicleTypeId = null) {
    if (!supabase) return null;
    let query = supabase.from('vehicle_brands').select('*').eq('status', 'active');
    if (vehicleTypeId) query = query.eq('vehicle_type_id', vehicleTypeId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getModels(brandId = null) {
    if (!supabase) return null;
    let query = supabase.from('vehicle_models').select('*').eq('status', 'active');
    if (brandId) query = query.eq('brand_id', brandId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getVariants(modelId = null) {
    if (!supabase) return null;
    let query = supabase.from('vehicle_variants').select('*').eq('status', 'active');
    if (modelId) query = query.eq('model_id', modelId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // ==================== CATEGORIES & BRANDS ====================
  async getCategories(vehicleType = null) {
    if (!supabase) return null;
    let query = supabase.from('categories').select('*');
    if (vehicleType) query = query.or(`vehicle_type.eq.${vehicleType},vehicle_type.is.null`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getPartBrands() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('brands').select('*').eq('status', 'active');
    if (error) throw error;
    return data;
  }

  // ==================== PRODUCTS ====================
  async getProducts(filters = {}) {
    if (!supabase) return null;
    const {
      vehicle_variant_id,
      year,
      category_slug,
      brand_slug,
      search,
      min_price,
      max_price,
      in_stock,
      sort_by = 'relevance',
      page = 1,
      limit = 12,
      featured,
      bestseller,
      new_arrival,
    } = filters;

    let query = supabase.from('products').select(`
      *,
      brand:brands(id, name, slug, logo_url, is_oem),
      category:categories(id, name, slug, vehicle_type),
      images:product_images(id, image_url, is_primary, display_order),
      compatibility:product_compatibility(id, vehicle_variant_id, year_from, year_to, notes)
    `, { count: 'exact' }).eq('status', 'active');

    if (featured === 'true' || featured === true) query = query.eq('is_featured', true);
    if (bestseller === 'true' || bestseller === true) query = query.eq('is_bestseller', true);
    if (new_arrival === 'true' || new_arrival === true) query = query.eq('is_new_arrival', true);
    if (in_stock === 'true' || in_stock === true) query = query.gt('stock_quantity', 0);
    if (min_price) query = query.gte('selling_price', Number(min_price));
    if (max_price) query = query.lte('selling_price', Number(max_price));
    if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,oem_number.ilike.%${search}%`);

    // Sorting
    if (sort_by === 'price_asc') query = query.order('selling_price', { ascending: true });
    else if (sort_by === 'price_desc') query = query.order('selling_price', { ascending: false });
    else if (sort_by === 'rating') query = query.order('rating', { ascending: false });
    else if (sort_by === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false });

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    let products = data || [];

    // Filter by vehicle compatibility if vehicle_variant_id is passed
    if (vehicle_variant_id) {
      const yearNum = year ? parseInt(year, 10) : null;
      products = products.filter((prod) => {
        if (!prod.compatibility || prod.compatibility.length === 0) return false;
        return prod.compatibility.some((fit) => {
          if (fit.vehicle_variant_id !== vehicle_variant_id) return false;
          if (yearNum) {
            if (fit.year_from && yearNum < fit.year_from) return false;
            if (fit.year_to && yearNum > fit.year_to) return false;
          }
          return true;
        });
      });
    }

    return {
      products,
      total: count || products.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || products.length) / limitNum) || 1,
    };
  }

  async getProductBySlug(slug) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:categories(*),
        images:product_images(*),
        compatibility:product_compatibility(
          *,
          variant:vehicle_variants(
            id, name, fuel_type, engine_capacity, year_from, year_to,
            model:vehicle_models(
              id, name, slug,
              brand:vehicle_brands(id, name, slug, vehicle_type_id)
            )
          )
        )
      `)
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // ==================== USERS & GARAGE ====================
  async getUserByEmail(email) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase().trim()).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getUserById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('id, name, email, phone, role, created_at').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createUser(userData) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) throw error;
    return data;
  }

  async getUserGarage(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('user_vehicles')
      .select(`
        *,
        variant:vehicle_variants(
          id, name, fuel_type, engine_capacity,
          model:vehicle_models(
            id, name,
            brand:vehicle_brands(id, name, vehicle_type_id)
          )
        )
      `)
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ==================== ORDERS & PAYMENTS ====================
  async createOrder(orderData, itemsData) {
    if (!supabase) return null;
    const { data: order, error: orderErr } = await supabase.from('orders').insert(orderData).select().single();
    if (orderErr) throw orderErr;

    if (itemsData && itemsData.length > 0) {
      const itemsWithOrderId = itemsData.map((item) => ({ ...item, order_id: order.id }));
      const { error: itemsErr } = await supabase.from('order_items').insert(itemsWithOrderId);
      if (itemsErr) throw itemsErr;
    }

    return order;
  }

  async getOrdersByUser(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payment:payments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

module.exports = new SupabaseService();
