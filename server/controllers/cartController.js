const db = require('../config/db');

exports.getCart = (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { session_id } = req.query;

    let cart = null;
    if (userId) {
      cart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(userId);
    } else if (session_id) {
      cart = db.prepare('SELECT * FROM carts WHERE session_id = ?').get(session_id);
    }

    if (!cart) {
      return res.json({ success: true, items: [], subtotal: 0 });
    }

    const items = db.prepare(`
      SELECT ci.id as cart_item_id, ci.quantity,
             p.id as product_id, p.name, p.slug, p.sku, p.selling_price, p.mrp, p.stock_quantity,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url,
             b.name as brand_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ci.cart_id = ?
    `).all(cart.id);

    let subtotal = 0;
    const formatted = items.map((i) => {
      const itemSubtotal = i.selling_price * i.quantity;
      subtotal += itemSubtotal;
      return {
        ...i,
        total: itemSubtotal,
      };
    });

    res.json({
      success: true,
      cart_id: cart.id,
      items: formatted,
      subtotal,
    });
  } catch (err) {
    next(err);
  }
};

exports.syncCart = (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { session_id, items } = req.body;

    if (!userId && !session_id) {
      return res.json({ success: true, message: 'Cart sync deferred for guest without session' });
    }

    let cart = null;
    if (userId) {
      cart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(userId);
      if (!cart) {
        const cartId = 'cart-' + Date.now();
        db.prepare('INSERT INTO carts (id, user_id) VALUES (?, ?)').run(cartId, userId);
        cart = { id: cartId };
      }
    } else {
      cart = db.prepare('SELECT * FROM carts WHERE session_id = ?').get(session_id);
      if (!cart) {
        const cartId = 'cart-' + Date.now();
        db.prepare('INSERT INTO carts (id, session_id) VALUES (?, ?)').run(cartId, session_id);
        cart = { id: cartId };
      }
    }

    // Upsert items
    if (Array.isArray(items)) {
      // Clear existing
      db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
      const insertItem = db.prepare('INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        const pid = item.product_id || item.id;
        const qty = parseInt(item.quantity, 10) || 1;
        insertItem.run('ci-' + Math.random().toString(36).substr(2, 9), cart.id, pid, qty);
      }
    }

    res.json({ success: true, message: 'Cart synced successfully', cart_id: cart.id });
  } catch (err) {
    next(err);
  }
};
