const db = require('../config/db');

// Dashboard statistics & metrics
exports.getDashboardStats = (req, res, next) => {
  try {
    const totalSalesRow = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'").get();
    const totalSales = totalSalesRow.total || 0;

    const todaySalesRow = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid' AND date(created_at) = date('now')").get();
    const todaySales = todaySalesRow.total || 0;

    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const todayOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now')").get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status IN ('pending', 'processing', 'packed')").get().count;
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get().count;
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold').get().count;

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `).all();

    // Top selling products
    const topProducts = db.prepare(`
      SELECT p.id, p.name, p.sku, p.selling_price, p.stock_quantity,
             SUM(oi.quantity) as units_sold, SUM(oi.total) as total_revenue,
             (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 5
    `).all();

    // Low stock products alert list
    const lowStockProducts = db.prepare(`
      SELECT id, name, sku, stock_quantity, low_stock_threshold, selling_price
      FROM products
      WHERE stock_quantity <= low_stock_threshold
      ORDER BY stock_quantity ASC
      LIMIT 8
    `).all();

    res.json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders,
        todayOrders,
        pendingOrders,
        totalProducts,
        totalCustomers,
        lowStockCount,
      },
      recentOrders: recentOrders.map(o => {
        let addr = o.shipping_address;
        if (typeof addr === 'string') {
          try { addr = JSON.parse(addr); } catch (e) {}
        }
        return { ...o, shipping_address: addr };
      }),
      topProducts,
      lowStockProducts,
    });
  } catch (err) {
    next(err);
  }
};

// Admin Products CRUD
exports.getAdminProducts = (req, res, next) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, b.name as brand_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM product_compatibility WHERE product_id = p.id) as compatible_vehicles_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC
    `).all();

    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = (req, res, next) => {
  try {
    const {
      name, slug, sku, oem_number, category_id, brand_id,
      description, short_description, mrp, selling_price, cost_price,
      gst_percentage, stock_quantity, low_stock_threshold, weight, warranty,
      is_featured, is_bestseller, is_new_arrival, image_url, specifications
    } = req.body;

    if (!name || !sku || !selling_price || !mrp) {
      return res.status(400).json({ success: false, message: 'Name, SKU, MRP and Selling Price are required' });
    }

    const productId = 'p-' + Date.now();
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    db.prepare(`
      INSERT INTO products (
        id, category_id, brand_id, name, slug, sku, oem_number,
        description, short_description, mrp, selling_price, cost_price,
        gst_percentage, stock_quantity, low_stock_threshold, weight, warranty,
        is_featured, is_bestseller, is_new_arrival, status, specifications
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, 'active', ?
      )
    `).run(
      productId, category_id || null, brand_id || null, name, productSlug, sku, oem_number || null,
      description || '', short_description || '', parseFloat(mrp), parseFloat(selling_price), parseFloat(cost_price || 0),
      parseFloat(gst_percentage || 18), parseInt(stock_quantity || 0, 10), parseInt(low_stock_threshold || 5, 10),
      parseFloat(weight || 0.5), warranty || '1 Year Warranty',
      is_featured ? 1 : 0, is_bestseller ? 1 : 0, is_new_arrival ? 1 : 0,
      typeof specifications === 'object' ? JSON.stringify(specifications) : (specifications || '{}')
    );

    if (image_url) {
      db.prepare('INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, 1, 0)')
        .run('pi-' + Date.now(), productId, image_url);
    }

    res.status(201).json({ success: true, message: 'Product created successfully', productId });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, sku, oem_number, category_id, brand_id,
      description, short_description, mrp, selling_price, cost_price,
      gst_percentage, stock_quantity, low_stock_threshold, weight, warranty,
      is_featured, is_bestseller, is_new_arrival, status, image_url, specifications
    } = req.body;

    db.prepare(`
      UPDATE products SET
        name = ?, sku = ?, oem_number = ?, category_id = ?, brand_id = ?,
        description = ?, short_description = ?, mrp = ?, selling_price = ?, cost_price = ?,
        gst_percentage = ?, stock_quantity = ?, low_stock_threshold = ?, weight = ?, warranty = ?,
        is_featured = ?, is_bestseller = ?, is_new_arrival = ?, status = ?,
        specifications = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, sku, oem_number || null, category_id || null, brand_id || null,
      description, short_description, parseFloat(mrp), parseFloat(selling_price), parseFloat(cost_price || 0),
      parseFloat(gst_percentage || 18), parseInt(stock_quantity, 10), parseInt(low_stock_threshold, 10),
      parseFloat(weight || 0.5), warranty,
      is_featured ? 1 : 0, is_bestseller ? 1 : 0, is_new_arrival ? 1 : 0, status || 'active',
      typeof specifications === 'object' ? JSON.stringify(specifications) : (specifications || '{}'),
      id
    );

    if (image_url) {
      const existingImg = db.prepare('SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1').get(id);
      if (existingImg) {
        db.prepare('UPDATE product_images SET image_url = ? WHERE id = ?').run(image_url, existingImg.id);
      } else {
        db.prepare('INSERT INTO product_images (id, product_id, image_url, is_primary) VALUES (?, ?, ?, 1)').run('pi-' + Date.now(), id, image_url);
      }
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Admin Orders
exports.getAdminOrders = (req, res, next) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();

    const formatted = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      let addr = o.shipping_address;
      if (typeof addr === 'string') {
        try { addr = JSON.parse(addr); } catch (e) {}
      }
      return {
        ...o,
        shipping_address: addr,
        items,
      };
    });

    res.json({ success: true, orders: formatted });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { order_status, tracking_number, courier_name } = req.body;

    if (!order_status) return res.status(400).json({ success: false, message: 'order_status required' });

    db.prepare(`
      UPDATE orders
      SET order_status = ?, tracking_number = COALESCE(?, tracking_number), courier_name = COALESCE(?, courier_name), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(order_status, tracking_number || null, courier_name || null, id);

    res.json({ success: true, message: `Order status updated to "${order_status}"` });
  } catch (err) {
    next(err);
  }
};

// Admin Compatibility Mapper
exports.addCompatibilityMapping = (req, res, next) => {
  try {
    const { product_id, vehicle_variant_id, year_from, year_to, notes } = req.body;
    if (!product_id || !vehicle_variant_id) {
      return res.status(400).json({ success: false, message: 'product_id and vehicle_variant_id required' });
    }

    const fitId = 'pf-' + Date.now();
    db.prepare(`
      INSERT INTO product_compatibility (id, product_id, vehicle_variant_id, year_from, year_to, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id, vehicle_variant_id) DO UPDATE SET
        year_from = excluded.year_from,
        year_to = excluded.year_to,
        notes = excluded.notes
    `).run(fitId, product_id, vehicle_variant_id, year_from || null, year_to || null, notes || 'Verified fit');

    res.status(201).json({ success: true, message: 'Compatibility mapping saved' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCompatibilityMapping = (req, res, next) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM product_compatibility WHERE id = ?').run(id);
    res.json({ success: true, message: 'Compatibility mapping removed' });
  } catch (err) {
    next(err);
  }
};

// Admin Customers
exports.getAdminCustomers = (req, res, next) => {
  try {
    const customers = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
             COUNT(DISTINCT o.id) as total_orders,
             COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_spent,
             MAX(o.created_at) as last_order_date
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY total_spent DESC, u.created_at DESC
    `).all();

    res.json({ success: true, customers });
  } catch (err) {
    next(err);
  }
};

// Admin Coupons
exports.getAdminCoupons = (req, res, next) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

exports.createAdminCoupon = (req, res, next) => {
  try {
    const { code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit } = req.body;
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ success: false, message: 'Code, discount type and value required' });
    }

    const cid = 'cp-' + Date.now();
    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      cid, code.toUpperCase().trim(), discount_type, parseFloat(discount_value),
      parseFloat(minimum_order || 0), maximum_discount ? parseFloat(maximum_discount) : null,
      parseInt(usage_limit || 1000, 10)
    );

    res.status(201).json({ success: true, message: 'Coupon created successfully' });
  } catch (err) {
    next(err);
  }
};
