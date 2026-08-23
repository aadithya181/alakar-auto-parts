const db = require('../config/db');

exports.getCategories = (req, res, next) => {
  try {
    const { vehicle_type } = req.query;
    let query = "SELECT * FROM categories WHERE status = 'active'";
    const params = [];

    if (vehicle_type) {
      query += ' AND (vehicle_type = ? OR vehicle_type IS NULL)';
      params.push(vehicle_type);
    }
    query += ' ORDER BY sort_order ASC, name ASC';

    const categories = db.prepare(query).all(...params);

    // Attach product counts
    const categoriesWithCount = categories.map((cat) => {
      const count = db.prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ? AND status = 'active'").get(cat.id).count;
      return {
        ...cat,
        product_count: count,
      };
    });

    res.json({ success: true, categories: categoriesWithCount });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryBySlug = (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = db.prepare("SELECT * FROM categories WHERE slug = ? AND status = 'active'").get(slug);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};
