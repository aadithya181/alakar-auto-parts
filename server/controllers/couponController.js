const db = require('../config/db');

exports.validateCoupon = (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const coupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND status = 'active'").get(code.toUpperCase().trim());
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const sub = parseFloat(subtotal) || 0;
    if (sub < coupon.minimum_order) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimum_order} required for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (sub * coupon.discount_value) / 100;
      if (coupon.maximum_discount && discount > coupon.maximum_discount) {
        discount = coupon.maximum_discount;
      }
    } else {
      discount = Math.min(coupon.discount_value, sub);
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: +discount.toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
};
