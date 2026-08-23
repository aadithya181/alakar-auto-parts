const db = require('../config/db');

class OrderService {
  /**
   * Validate cart items and calculate totals strictly from DB records
   */
  calculateOrderPricing(items, couponCode = null) {
    if (!items || items.length === 0) {
      throw new Error('Cart is empty');
    }

    let subtotal = 0;
    let validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id || item.id);
      if (!product) {
        throw new Error(`Product not found with ID: ${item.product_id || item.id}`);
      }

      if (product.status !== 'active') {
        throw new Error(`Product "${product.name}" is no longer available`);
      }

      const qty = parseInt(item.quantity, 10) || 1;
      if (product.stock_quantity < qty) {
        throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock_quantity} remaining.`);
      }

      // Get primary image
      const primaryImg = db.prepare('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC LIMIT 1').get(product.id);

      const itemTotal = product.selling_price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        image_url: primaryImg ? primaryImg.image_url : null,
        quantity: qty,
        price: product.selling_price,
        total: itemTotal,
        gst_percentage: product.gst_percentage || 18.0,
      });
    }

    // Shipping rules: Free above ₹999, else ₹99
    const shippingCharge = subtotal >= 999 ? 0.00 : 99.00;

    // Tax calculation (inclusive in selling price for standard Indian retail display, but computed here)
    const tax = +(subtotal * 0.18 / 1.18).toFixed(2);

    // Coupon calculation
    let discount = 0.00;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND status = 'active'").get(couponCode.toUpperCase().trim());
      if (coupon) {
        // Check minimum order
        if (subtotal >= coupon.minimum_order) {
          if (coupon.discount_type === 'percentage') {
            let calculatedDisc = (subtotal * coupon.discount_value) / 100;
            if (coupon.maximum_discount && calculatedDisc > coupon.maximum_discount) {
              calculatedDisc = coupon.maximum_discount;
            }
            discount = +calculatedDisc.toFixed(2);
          } else if (coupon.discount_type === 'fixed') {
            discount = Math.min(coupon.discount_value, subtotal);
          }
          appliedCoupon = coupon;
        }
      }
    }

    const totalAmount = Math.max(0, +(subtotal - discount + shippingCharge).toFixed(2));

    return {
      subtotal: +subtotal.toFixed(2),
      discount: +discount.toFixed(2),
      shipping_charge: +shippingCharge.toFixed(2),
      tax: +tax,
      total_amount: +totalAmount.toFixed(2),
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      items: validatedItems,
    };
  }

  /**
   * Create an internal pending order in database
   */
  createPendingOrder(userId, pricing, shippingAddress) {
    const orderId = 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const orderNumber = 'TRQ-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, user_id, order_number, subtotal, discount, shipping_charge,
        tax, total_amount, coupon_code, payment_status, order_status,
        shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)
    `);

    insertOrder.run(
      orderId,
      userId || null,
      orderNumber,
      pricing.subtotal,
      pricing.discount,
      pricing.shipping_charge,
      pricing.tax,
      pricing.total_amount,
      pricing.coupon_code,
      JSON.stringify(shippingAddress)
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, sku, image_url, quantity, price, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of pricing.items) {
      const itemId = 'oi-' + Math.random().toString(36).substr(2, 9);
      insertItem.run(
        itemId,
        orderId,
        item.product_id,
        item.product_name,
        item.sku,
        item.image_url,
        item.quantity,
        item.price,
        item.total
      );
    }

    return {
      orderId,
      orderNumber,
      ...pricing,
      shipping_address: shippingAddress,
    };
  }

  /**
   * Deduct inventory and confirm order after successful payment
   */
  completeOrder(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) throw new Error('Order not found');

    const updateOrder = db.prepare(`
      UPDATE orders 
      SET payment_status = 'paid', 
          order_status = 'confirmed',
          razorpay_order_id = ?,
          razorpay_payment_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateOrder.run(razorpayOrderId, razorpayPaymentId, orderId);

    // Record payment
    const paymentId = 'pay-' + Date.now();
    const insertPayment = db.prepare(`
      INSERT INTO payments (id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, method)
      VALUES (?, ?, ?, ?, ?, ?, 'paid', 'razorpay')
    `);
    insertPayment.run(paymentId, orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, order.total_amount);

    // Atomically reduce stock
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    const updateStock = db.prepare(`
      UPDATE products 
      SET stock_quantity = MAX(0, stock_quantity - ?),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    for (const itm of items) {
      if (itm.product_id) {
        updateStock.run(itm.quantity, itm.product_id);
      }
    }

    // Record coupon usage if applied
    if (order.coupon_code && order.user_id) {
      const coupon = db.prepare('SELECT id FROM coupons WHERE code = ?').get(order.coupon_code);
      if (coupon) {
        db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
        db.prepare(`
          INSERT INTO coupon_usage (id, coupon_id, user_id, order_id, discount_amount)
          VALUES (?, ?, ?, ?, ?)
        `).run('cu-' + Date.now(), coupon.id, order.user_id, orderId, order.discount);
      }
    }

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  }
}

module.exports = new OrderService();
