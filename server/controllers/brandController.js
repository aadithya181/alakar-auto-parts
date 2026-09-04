const db = require('../config/db');

exports.getBrands = (req, res, next) => {
  try {
    const { featured } = req.query;
    let query = "SELECT * FROM brands WHERE status = 'active'";
    const params = [];

    if (featured === 'true' || featured === '1') {
      query += ' AND is_featured = 1';
    }
    query += ' ORDER BY is_featured DESC, name ASC';

    const brands = db.prepare(query).all(...params);

    const brandsWithCount = brands.map((br) => {
      const row = db.prepare("SELECT COUNT(*) as count FROM products WHERE brand_id = ? AND status = 'active'").get(br.id);
      const count = row && typeof row.count === 'number' ? row.count : 0;
      return { ...br, product_count: count };
    });

    res.json({ success: true, brands: brandsWithCount });
  } catch (err) {
    next(err);
  }
};
