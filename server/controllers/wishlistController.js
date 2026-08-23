const db = require('../config/db');

// Wishlist
exports.getWishlist = (req, res, next) => {
  try {
    const products = db.prepare(`
      SELECT p.*,
             c.name as category_name,
             b.name as brand_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(req.user.id);

    res.json({ success: true, wishlist: products });
  } catch (err) {
    next(err);
  }
};

exports.toggleWishlist = (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'product_id required' });

    const existing = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);

    if (existing) {
      db.prepare('DELETE FROM wishlists WHERE id = ?').run(existing.id);
      return res.json({ success: true, inWishlist: false, message: 'Removed from wishlist' });
    } else {
      const wid = 'w-' + Date.now();
      db.prepare('INSERT INTO wishlists (id, user_id, product_id) VALUES (?, ?, ?)').run(wid, req.user.id, product_id);
      return res.json({ success: true, inWishlist: true, message: 'Added to wishlist' });
    }
  } catch (err) {
    next(err);
  }
};
