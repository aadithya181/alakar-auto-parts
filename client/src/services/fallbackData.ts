import fallbackDb from '../data/torqspares_data.json';

export function handleFallbackApi(method: string, url: string, params: any = {}, body: any = {}): any {
  const normUrl = url.replace(/^\/api/, '');
  const state = fallbackDb as any;

  // 0. Auth Fallbacks
  if (normUrl === '/auth/login' && method.toUpperCase() === 'POST') {
    const email = (body.email || '').toLowerCase().trim();
    const isAdmin = email.includes('admin');
    const demoUser = isAdmin ? {
      id: '00000000-0000-4000-a000-000000000001',
      name: 'Surendar (Admin)',
      email: email || 'admin@newalagarautoparts.com',
      phone: '+91 85266 13000',
      role: 'admin'
    } : {
      id: '00000000-0000-4000-a000-000000000002',
      name: 'Karthik Raja',
      email: email || 'customer@newalagarautoparts.com',
      phone: '+91 94433 22110',
      role: 'customer'
    };

    return {
      success: true,
      message: 'Login successful',
      token: 'fallback_token_' + Date.now(),
      user: demoUser
    };
  }

  if (normUrl === '/auth/register' && method.toUpperCase() === 'POST') {
    const newUser = {
      id: 'usr_' + Date.now(),
      name: body.name || 'User',
      email: body.email || 'user@newalagarautoparts.com',
      phone: body.phone || '+91 98765 43210',
      role: 'customer'
    };
    return {
      success: true,
      message: 'Registration successful',
      token: 'fallback_token_' + Date.now(),
      user: newUser
    };
  }

  if (normUrl === '/auth/profile' && method.toUpperCase() === 'GET') {
    let parsedUser = null;
    try {
      const saved = localStorage.getItem('torq_user');
      parsedUser = saved ? JSON.parse(saved) : null;
    } catch (e) {}

    return {
      success: true,
      user: parsedUser || {
        id: '00000000-0000-4000-a000-000000000001',
        name: 'Surendar (Admin)',
        email: 'admin@newalagarautoparts.com',
        role: 'admin',
        savedVehicles: []
      }
    };
  }

  // 1. Categories
  if (normUrl === '/categories' && method.toUpperCase() === 'GET') {
    let cats = state.categories || [];
    if (params.vehicle_type) {
      cats = cats.filter((c: any) => c.vehicle_type === params.vehicle_type || !c.vehicle_type);
    }
    return { success: true, categories: cats };
  }

  // 2. Brands
  if (normUrl === '/brands' && method.toUpperCase() === 'GET') {
    let brs = state.brands || [];
    if (params.featured) {
      brs = brs.filter((b: any) => b.is_featured);
    }
    return { success: true, brands: brs };
  }

  // 3. Vehicles
  if (normUrl === '/vehicles/types') {
    return { success: true, vehicleTypes: state.vehicle_types || [] };
  }
  if (normUrl === '/vehicles/brands') {
    let brands = state.vehicle_brands || [];
    if (params.type_id) brands = brands.filter((b: any) => b.vehicle_type_id === params.type_id);
    return { success: true, brands };
  }
  if (normUrl === '/vehicles/models') {
    let models = state.vehicle_models || [];
    if (params.brand_id) models = models.filter((m: any) => m.brand_id === params.brand_id);
    return { success: true, models };
  }
  if (normUrl === '/vehicles/variants') {
    let variants = state.vehicle_variants || [];
    if (params.model_id) variants = variants.filter((v: any) => v.model_id === params.model_id);
    return { success: true, variants };
  }

  // 4. Products List
  if (normUrl === '/products' && method.toUpperCase() === 'GET') {
    let matching = (state.products || []).filter((p: any) => p.status === 'active');

    // Vehicle variant filter
    if (params.vehicle_variant_id) {
      const yearNum = params.year ? parseInt(params.year, 10) : null;
      const validProductIds = new Set(
        (state.product_compatibility || [])
          .filter((fit: any) => {
            if (fit.vehicle_variant_id !== params.vehicle_variant_id) return false;
            if (yearNum) {
              if (fit.year_from && yearNum < fit.year_from) return false;
              if (fit.year_to && yearNum > fit.year_to) return false;
            }
            return true;
          })
          .map((fit: any) => fit.product_id)
      );
      matching = matching.filter((p: any) => validProductIds.has(p.id));
    }

    // Vehicle Type
    if (params.vehicle_type) {
      const validCatIds = new Set(
        (state.categories || [])
          .filter((c: any) => c.vehicle_type === params.vehicle_type || !c.vehicle_type)
          .map((c: any) => c.id)
      );
      matching = matching.filter((p: any) => validCatIds.has(p.category_id));
    }

    // Category Slug
    if (params.category_slug) {
      const cat = (state.categories || []).find((c: any) => c.slug === params.category_slug);
      if (cat) matching = matching.filter((p: any) => p.category_id === cat.id);
    }

    // Brand Slug
    if (params.brand_slug) {
      const br = (state.brands || []).find((b: any) => b.slug === params.brand_slug);
      if (br) matching = matching.filter((p: any) => p.brand_id === br.id);
    }

    // Search
    if (params.search && params.search.trim()) {
      const term = params.search.toLowerCase().trim();
      matching = matching.filter((p: any) => {
        const br = (state.brands || []).find((b: any) => b.id === p.brand_id);
        const cat = (state.categories || []).find((c: any) => c.id === p.category_id);
        return (
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          (p.oem_number && p.oem_number.toLowerCase().includes(term)) ||
          (br && br.name.toLowerCase().includes(term)) ||
          (cat && cat.name.toLowerCase().includes(term))
        );
      });
    }

    // Price
    if (params.min_price) matching = matching.filter((p: any) => p.selling_price >= parseFloat(params.min_price));
    if (params.max_price) matching = matching.filter((p: any) => p.selling_price <= parseFloat(params.max_price));

    // Stock
    if (params.in_stock === 'true' || params.in_stock === true) {
      matching = matching.filter((p: any) => p.stock_quantity > 0);
    }

    // Flags
    if (params.featured === 'true' || params.featured === true) {
      matching = matching.filter((p: any) => p.is_featured);
    }
    if (params.bestseller === 'true' || params.bestseller === true) {
      matching = matching.filter((p: any) => p.is_bestseller);
    }
    if (params.new_arrival === 'true' || params.new_arrival === true) {
      matching = matching.filter((p: any) => p.is_new_arrival);
    }

    // Sorting
    if (params.sort_by === 'price_asc') matching.sort((a: any, b: any) => a.selling_price - b.selling_price);
    else if (params.sort_by === 'price_desc') matching.sort((a: any, b: any) => b.selling_price - a.selling_price);

    const totalCount = matching.length;
    const pageNum = parseInt(params.page, 10) || 1;
    const limitNum = parseInt(params.limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;
    const paged = matching.slice(offset, offset + limitNum);

    const formatted = paged.map((p: any) => {
      const cat = (state.categories || []).find((c: any) => c.id === p.category_id);
      const br = (state.brands || []).find((b: any) => b.id === p.brand_id);
      const pImages = (state.product_images || []).filter((img: any) => img.product_id === p.id);
      const primaryImg = pImages.find((img: any) => img.is_primary) || pImages[0];

      return {
        ...p,
        specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {}),
        category_name: cat ? cat.name : '',
        category_slug: cat ? cat.slug : '',
        vehicle_type: cat ? cat.vehicle_type : 'car',
        brand_name: br ? br.name : '',
        brand_slug: br ? br.slug : '',
        brand_logo_url: br ? br.logo_url : '',
        primary_image: primaryImg ? primaryImg.image_url : '/images/products/5m-single-horn-box.jpeg',
        images: pImages,
        avg_rating: '4.8',
        total_reviews: 12,
        discount_percentage: Math.round(((p.mrp - p.selling_price) / p.mrp) * 100),
      };
    });

    return {
      success: true,
      products: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    };
  }

  // 5. Product Detail By Slug
  if (normUrl.startsWith('/products/') && method.toUpperCase() === 'GET') {
    const slug = normUrl.replace('/products/', '');
    const p = (state.products || []).find((item: any) => item.slug === slug || item.id === slug);
    if (!p) return { success: false, message: 'Product not found' };

    const cat = (state.categories || []).find((c: any) => c.id === p.category_id);
    const br = (state.brands || []).find((b: any) => b.id === p.brand_id);
    const images = (state.product_images || []).filter((img: any) => img.product_id === p.id);

    const compatibility = (state.product_compatibility || [])
      .filter((fit: any) => fit.product_id === p.id)
      .map((pc: any) => {
        const variant = (state.vehicle_variants || []).find((v: any) => v.id === pc.vehicle_variant_id);
        const model = variant ? (state.vehicle_models || []).find((m: any) => m.id === variant.model_id) : null;
        const brand = model ? (state.vehicle_brands || []).find((b: any) => b.id === model.brand_id) : null;
        return {
          ...pc,
          variant_name: variant ? variant.name : '',
          fuel_type: variant ? variant.fuel_type : '',
          engine_capacity: variant ? variant.engine_capacity : '',
          model_name: model ? model.name : '',
          model_slug: model ? model.slug : '',
          brand_name: brand ? brand.name : '',
          brand_slug: brand ? brand.slug : '',
          vehicle_type_id: brand ? brand.vehicle_type_id : '',
        };
      });

    const relatedProducts = (state.products || [])
      .filter((item: any) => item.id !== p.id && item.category_id === p.category_id && item.status === 'active')
      .slice(0, 4)
      .map((rp: any) => {
        const rImages = (state.product_images || []).filter((img: any) => img.product_id === rp.id);
        const rPrimary = rImages.find((img: any) => img.is_primary) || rImages[0];
        const rBr = (state.brands || []).find((b: any) => b.id === rp.brand_id);
        return {
          ...rp,
          primary_image: rPrimary ? rPrimary.image_url : '/images/products/5m-single-horn-box.jpeg',
          brand_name: rBr ? rBr.name : '',
          avg_rating: '4.8',
          discount_percentage: Math.round(((rp.mrp - rp.selling_price) / rp.mrp) * 100),
        };
      });

    return {
      success: true,
      product: {
        ...p,
        specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {}),
        category_name: cat ? cat.name : '',
        category_slug: cat ? cat.slug : '',
        vehicle_type: cat ? cat.vehicle_type : 'car',
        brand_name: br ? br.name : '',
        brand_slug: br ? br.slug : '',
        brand_logo_url: br ? br.logo_url : '',
        primary_image: images[0]?.image_url || '/images/products/5m-single-horn-box.jpeg',
        images,
        compatibility,
        reviews: [],
        avg_rating: '4.8',
        total_reviews: 12,
        discount_percentage: Math.round(((p.mrp - p.selling_price) / p.mrp) * 100),
      },
      relatedProducts,
    };
  }

  // 6. Admin Products
  if (normUrl === '/admin/products' && method.toUpperCase() === 'GET') {
    const formatted = (state.products || []).map((p: any) => {
      const cat = (state.categories || []).find((c: any) => c.id === p.category_id);
      const br = (state.brands || []).find((b: any) => b.id === p.brand_id);
      const pImages = (state.product_images || []).filter((img: any) => img.product_id === p.id);
      const primaryImg = pImages.find((img: any) => img.is_primary) || pImages[0];
      const compCount = (state.product_compatibility || []).filter((c: any) => c.product_id === p.id).length;

      return {
        ...p,
        category_name: cat ? cat.name : '',
        brand_name: br ? br.name : '',
        primary_image: primaryImg ? primaryImg.image_url : '/images/products/5m-single-horn-box.jpeg',
        compatible_vehicles_count: compCount,
      }; 
    });
    return { success: true, products: formatted };
  }

  // Admin POST product
  if (normUrl === '/admin/products' && method.toUpperCase() === 'POST') {
    const newId = 'p-' + Date.now();
    const newProd = {
      id: newId,
      name: body.name,
      sku: body.sku,
      category_id: body.category_id,
      brand_id: body.brand_id,
      mrp: Number(body.mrp),
      selling_price: Number(body.selling_price),
      cost_price: Number(body.cost_price || 0),
      stock_quantity: Number(body.stock_quantity),
      description: body.description || '',
      short_description: body.short_description || '',
      status: body.status || 'active',
      is_featured: Boolean(body.is_featured),
      is_bestseller: Boolean(body.is_bestseller),
      is_new_arrival: Boolean(body.is_new_arrival),
      created_at: new Date().toISOString(),
    };
    state.products = state.products || [];
    state.products.unshift(newProd);
    if (body.image_url) {
      state.product_images = state.product_images || [];
      state.product_images.push({ id: 'pi-' + Date.now(), product_id: newId, image_url: body.image_url, is_primary: 1 });
    }
    return { success: true, message: 'Product created successfully', productId: newId };
  }

  // Admin PUT product
  if (normUrl.startsWith('/admin/products/') && method.toUpperCase() === 'PUT') {
    const prodId = normUrl.replace('/admin/products/', '');
    const prod = (state.products || []).find((p: any) => p.id === prodId);
    if (prod) {
      Object.assign(prod, {
        name: body.name || prod.name,
        sku: body.sku || prod.sku,
        category_id: body.category_id || prod.category_id,
        brand_id: body.brand_id || prod.brand_id,
        mrp: Number(body.mrp) || prod.mrp,
        selling_price: Number(body.selling_price) || prod.selling_price,
        cost_price: Number(body.cost_price) || prod.cost_price,
        stock_quantity: Number(body.stock_quantity) !== undefined ? Number(body.stock_quantity) : prod.stock_quantity,
        description: body.description !== undefined ? body.description : prod.description,
        short_description: body.short_description !== undefined ? body.short_description : prod.short_description,
        status: body.status || prod.status,
        is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : prod.is_featured,
        is_bestseller: body.is_bestseller !== undefined ? Boolean(body.is_bestseller) : prod.is_bestseller,
        is_new_arrival: body.is_new_arrival !== undefined ? Boolean(body.is_new_arrival) : prod.is_new_arrival,
      });
      if (body.image_url) {
        state.product_images = state.product_images || [];
        const existing = state.product_images.find((img: any) => img.product_id === prodId && img.is_primary);
        if (existing) {
          existing.image_url = body.image_url;
        } else {
          state.product_images.push({ id: 'pi-' + Date.now(), product_id: prodId, image_url: body.image_url, is_primary: 1 });
        }
      }
    }
    return { success: true, message: 'Product updated successfully' };
  }

  // Admin DELETE product
  if (normUrl.startsWith('/admin/products/') && method.toUpperCase() === 'DELETE') {
    const prodId = normUrl.replace('/admin/products/', '');
    state.products = (state.products || []).filter((p: any) => p.id !== prodId);
    state.product_images = (state.product_images || []).filter((img: any) => img.product_id !== prodId);
    state.product_compatibility = (state.product_compatibility || []).filter((c: any) => c.product_id !== prodId);
    return { success: true, message: 'Product deleted successfully' };
  }

  // 7. Admin Dashboard & Stats (Real-time live amounts)
  if ((normUrl === '/admin/dashboard' || normUrl === '/admin/stats') && method.toUpperCase() === 'GET') {
    const orders = state.orders || [];
    const paidOrders = orders.filter((o: any) => o.payment_status === 'paid');
    const totalSales = paidOrders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = paidOrders
      .filter((o: any) => (o.created_at || '').slice(0, 10) === today)
      .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
    const pendingOrders = orders.filter((o: any) => ['pending', 'processing', 'packed'].includes(o.order_status)).length;
    const realCustomers = (state.users || []).filter((u: any) => u.role === 'customer').length;

    return {
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders: orders.length,
        pendingOrders,
        totalProducts: (state.products || []).length,
        totalCustomers: realCustomers,
        lowStockCount: (state.products || []).filter((p: any) => p.stock_quantity <= (p.low_stock_threshold || 5)).length,
      },
      recentOrders: orders.slice(0, 6),
      topProducts: [],
      lowStockProducts: (state.products || []).filter((p: any) => p.stock_quantity <= (p.low_stock_threshold || 5)).slice(0, 5),
    };
  }

  // Admin Orders
  if (normUrl === '/admin/orders' && method.toUpperCase() === 'GET') {
    return {
      success: true,
      orders: state.orders || []
    };
  }

  // 8. Coupons
  if (normUrl === '/coupons') {
    return {
      success: true,
      coupons: [
        { id: 'cpn-first50', code: 'FIRST50', discount_type: 'fixed', discount_value: 50, min_order_value: 499, description: 'Flat ₹50 OFF on your first spare parts order' },
        { id: 'cpn-torq10', code: 'ALAGAR10', discount_type: 'percentage', discount_value: 10, min_order_value: 1200, max_discount: 300, description: '10% instant discount on orders above ₹1,200' },
        { id: 'cpn-torq11', code: 'ALAKAR10', discount_type: 'percentage', discount_value: 10, min_order_value: 1200, max_discount: 300, description: '10% instant discount on orders above ₹1,200' },
      ],
    };
  }

  return { success: false, message: 'Not found in local fallback' };
}
