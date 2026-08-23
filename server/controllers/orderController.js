const orderService = require('../services/orderService');
const db = require('../config/db');

exports.createOrder = (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { items, coupon_code, shipping_address } = req.body;

    if (!shipping_address || !shipping_address.full_name || !shipping_address.phone || !shipping_address.address_line_1) {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required.' });
    }

    // Strict server-side pricing recalculation from DB
    const pricing = orderService.calculateOrderPricing(items, coupon_code);

    // Create internal pending order
    const order = orderService.createPendingOrder(userId, pricing, shipping_address);

    res.status(201).json({
      success: true,
      message: 'Pending order created successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderDetails = (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check: Customer can only view their own order unless admin
    if (req.user && req.user.role !== 'admin' && order.user_id && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    res.json({
      success: true,
      order: {
        ...order,
        shipping_address: JSON.parse(order.shipping_address),
        items,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = (req, res, next) => {
  try {
    const orders = db.prepare(`
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id);

    const fullOrders = orders.map((ord) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return {
        ...ord,
        shipping_address: JSON.parse(ord.shipping_address),
        items,
      };
    });

    res.json({ success: true, orders: fullOrders });
  } catch (err) {
    next(err);
  }
};
