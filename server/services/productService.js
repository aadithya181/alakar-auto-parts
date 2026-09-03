const db = require('../config/db');

class ProductService {
  getProducts(filters = {}) {
    const {
      vehicle_type,
      vehicle_brand_id,
      vehicle_model_id,
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

    const state = db.getState();
    let matching = state.products.filter((p) => p.status === 'active');

    // 1. Vehicle Variant filtering
    if (vehicle_variant_id) {
      const yearNum = year ? parseInt(year, 10) : null;
      const validProductIds = new Set(
        state.product_compatibility
          .filter((fit) => {
            if (fit.vehicle_variant_id !== vehicle_variant_id) return false;
            if (yearNum) {
              if (fit.year_from && yearNum < fit.year_from) return false;
              if (fit.year_to && yearNum > fit.year_to) return false;
            }
            return true;
          })
          .map((fit) => fit.product_id)
      );

      matching = matching.filter((p) => validProductIds.has(p.id));
    } else if (vehicle_model_id) {
      // Find all variants for this model
      const variantIds = new Set(
        state.vehicle_variants.filter((v) => v.model_id === vehicle_model_id).map((v) => v.id)
      );
      const validProductIds = new Set(
        state.product_compatibility
          .filter((fit) => variantIds.has(fit.vehicle_variant_id))
          .map((fit) => fit.product_id)
      );
      matching = matching.filter((p) => validProductIds.has(p.id));
    } else if (vehicle_brand_id) {
      // Find all models for this brand
      const modelIds = new Set(
        state.vehicle_models.filter((m) => m.brand_id === vehicle_brand_id).map((m) => m.id)
      );
      const variantIds = new Set(
        state.vehicle_variants.filter((v) => modelIds.has(v.model_id)).map((v) => v.id)
      );
      const validProductIds = new Set(
        state.product_compatibility
          .filter((fit) => variantIds.has(fit.vehicle_variant_id))
          .map((fit) => fit.product_id)
      );
      matching = matching.filter((p) => validProductIds.has(p.id));
    }

    // 2. Vehicle Type (car or bike)
    if (vehicle_type) {
      const validCatIds = new Set(
        state.categories
          .filter((c) => c.vehicle_type === vehicle_type || !c.vehicle_type)
          .map((c) => c.id)
      );
      matching = matching.filter((p) => validCatIds.has(p.category_id));
    }

    // 3. Category Slug
    if (category_slug) {
      const cat = state.categories.find((c) => c.slug === category_slug);
      if (cat) {
        matching = matching.filter((p) => p.category_id === cat.id);
      }
    }

    // 4. Brand Slug
    if (brand_slug) {
      const br = state.brands.find((b) => b.slug === brand_slug);
      if (br) {
        matching = matching.filter((p) => p.brand_id === br.id);
      }
    }

    // 5. Search query
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      matching = matching.filter((p) => {
        const brand = state.brands.find((b) => b.id === p.brand_id);
        const cat = state.categories.find((c) => c.id === p.category_id);
        return (
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          (p.oem_number && p.oem_number.toLowerCase().includes(term)) ||
          (brand && brand.name.toLowerCase().includes(term)) ||
          (cat && cat.name.toLowerCase().includes(term))
        );
      });
    }

    // 6. Price range
    if (min_price) {
      matching = matching.filter((p) => p.selling_price >= parseFloat(min_price));
    }
    if (max_price) {
      matching = matching.filter((p) => p.selling_price <= parseFloat(max_price));
    }

    // 7. Stock availability
    if (in_stock === 'true' || in_stock === true) {
      matching = matching.filter((p) => p.stock_quantity > 0);
    }

    // 8. Flags
    if (featured === 'true' || featured === true) {
      matching = matching.filter((p) => p.is_featured);
    }
    if (bestseller === 'true' || bestseller === true) {
      matching = matching.filter((p) => p.is_bestseller);
    }
    if (new_arrival === 'true' || new_arrival === true) {
      matching = matching.filter((p) => p.is_new_arrival);
    }

    // Sorting
    if (sort_by === 'price_asc') {
      matching.sort((a, b) => a.selling_price - b.selling_price);
    } else if (sort_by === 'price_desc') {
      matching.sort((a, b) => b.selling_price - a.selling_price);
    } else if (sort_by === 'newest') {
      matching.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort_by === 'bestseller' || sort_by === 'popularity') {
      matching.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    }

    const totalCount = matching.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;
    const paged = matching.slice(offset, offset + limitNum);

    const formatted = paged.map((p) => {
      const cat = state.categories.find((c) => c.id === p.category_id);
      const br = state.brands.find((b) => b.id === p.brand_id);
      const pImages = state.product_images.filter((img) => img.product_id === p.id);
      const primaryImg = pImages.find((img) => img.is_primary) || pImages[0];
      const pReviews = state.reviews.filter((r) => r.product_id === p.id && r.status === 'approved');
      const avg = pReviews.length
        ? (pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1)
        : '4.8';

      return {
        ...p,
        specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {}),
        category_name: cat ? cat.name : '',
        category_slug: cat ? cat.slug : '',
        vehicle_type: cat ? cat.vehicle_type : 'car',
        brand_name: br ? br.name : '',
        brand_slug: br ? br.slug : '',
        brand_logo_url: br ? br.logo_url : '',
        primary_image: primaryImg ? primaryImg.image_url : 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800',
        images: pImages,
        avg_rating: avg,
        total_reviews: pReviews.length,
        discount_percentage: Math.round(((p.mrp - p.selling_price) / p.mrp) * 100),
      };
    });

    return {
      products: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    };
  }

  getProductBySlug(slug) {
    const state = db.getState();
    const p = state.products.find((prod) => prod.slug === slug || prod.id === slug);
    if (!p) return null;

    const cat = state.categories.find((c) => c.id === p.category_id);
    const br = state.brands.find((b) => b.id === p.brand_id);
    const images = state.product_images.filter((img) => img.product_id === p.id);

    const compatibility = state.product_compatibility
      .filter((fit) => fit.product_id === p.id)
      .map((pc) => {
        const variant = state.vehicle_variants.find((v) => v.id === pc.vehicle_variant_id);
        const model = variant ? state.vehicle_models.find((m) => m.id === variant.model_id) : null;
        const brand = model ? state.vehicle_brands.find((b) => b.id === model.brand_id) : null;
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

    const reviews = state.reviews
      .filter((r) => r.product_id === p.id && r.status === 'approved')
      .map((r) => {
        const u = state.users.find((usr) => usr.id === r.user_id);
        return {
          ...r,
          user_name: u ? u.name : 'Verified Customer',
        };
      });

    const avg = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '4.8';

    return {
      ...p,
      specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {}),
      images: images.length > 0 ? images : [{ id: 'fallback', image_url: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800', is_primary: 1 }],
      category_name: cat ? cat.name : '',
      category_slug: cat ? cat.slug : '',
      vehicle_type: cat ? cat.vehicle_type : 'car',
      brand_name: br ? br.name : '',
      brand_slug: br ? br.slug : '',
      brand_logo_url: br ? br.logo_url : '',
      brand_description: br ? br.description : '',
      compatibility,
      reviews,
      avg_rating: avg,
      total_reviews: reviews.length,
      discount_percentage: Math.round(((p.mrp - p.selling_price) / p.mrp) * 100),
    };
  }

  getSearchSuggestions(query) {
    if (!query || query.trim().length < 2) return [];
    const term = query.toLowerCase().trim();
    const state = db.getState();

    const matched = state.products
      .filter((p) => {
        if (p.status !== 'active') return false;
        const br = state.brands.find((b) => b.id === p.brand_id);
        return (
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          (br && br.name.toLowerCase().includes(term))
        );
      })
      .slice(0, 6);

    return matched.map((p) => {
      const br = state.brands.find((b) => b.id === p.brand_id);
      const pImg = state.product_images.find((img) => img.product_id === p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        selling_price: p.selling_price,
        sku: p.sku,
        brand_name: br ? br.name : '',
        image_url: pImg ? pImg.image_url : 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=400',
      };
    });
  }
}

module.exports = new ProductService();
