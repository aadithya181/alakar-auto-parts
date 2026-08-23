const db = require('../config/db');

exports.createReview = (req, res, next) => {
  try {
    const { product_id, order_id, rating, review } = req.body;
    if (!product_id || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and Rating (1-5) are required' });
    }

    // Verify if user bought the product
    let isVerified = 1;
    if (order_id) {
      const order = db.prepare('SELECT id FROM orders WHERE id = ? AND user_id = ? AND payment_status = \'paid\'').get(order_id, req.user.id);
      if (!order) isVerified = 0;
    }

    const reviewId = 'rev-' + Date.now();
    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, order_id, rating, review, is_verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
    `).run(reviewId, product_id, req.user.id, order_id || null, parseInt(rating, 10), review || '', isVerified);

    res.status(201).json({ success: true, message: 'Review submitted successfully!' });
  } catch (err) {
    next(err);
  }
};
