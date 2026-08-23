const db = require('../config/db');

exports.getVehicleTypes = (req, res, next) => {
  try {
    const types = db.prepare('SELECT * FROM vehicle_types').all();
    res.json({ success: true, types });
  } catch (err) {
    next(err);
  }
};

exports.getBrands = (req, res, next) => {
  try {
    const { type } = req.query; // 'car' or 'bike'
    let query = "SELECT * FROM vehicle_brands WHERE status = 'active'";
    const params = [];

    if (type) {
      query += ' AND vehicle_type_id = ?';
      params.push(type);
    }
    query += ' ORDER BY name ASC';

    const brands = db.prepare(query).all(...params);
    res.json({ success: true, brands });
  } catch (err) {
    next(err);
  }
};

exports.getModels = (req, res, next) => {
  try {
    const { brand_id } = req.query;
    if (!brand_id) {
      return res.status(400).json({ success: false, message: 'brand_id is required' });
    }

    const models = db.prepare(`
      SELECT * FROM vehicle_models 
      WHERE brand_id = ? AND status = 'active' 
      ORDER BY name ASC
    `).all(brand_id);

    res.json({ success: true, models });
  } catch (err) {
    next(err);
  }
};

exports.getVariants = (req, res, next) => {
  try {
    const { model_id } = req.query;
    if (!model_id) {
      return res.status(400).json({ success: false, message: 'model_id is required' });
    }

    const variants = db.prepare(`
      SELECT * FROM vehicle_variants 
      WHERE model_id = ? AND status = 'active' 
      ORDER BY year_from DESC, name ASC
    `).all(model_id);

    res.json({ success: true, variants });
  } catch (err) {
    next(err);
  }
};

exports.getVehicleFullDetails = (req, res, next) => {
  try {
    const { variant_id } = req.params;
    const vehicle = db.prepare(`
      SELECT vv.*, vm.name as model_name, vm.slug as model_slug,
             vb.name as brand_name, vb.slug as brand_slug, vb.vehicle_type_id,
             vt.name as vehicle_type_name
      FROM vehicle_variants vv
      JOIN vehicle_models vm ON vv.model_id = vm.id
      JOIN vehicle_brands vb ON vm.brand_id = vb.id
      JOIN vehicle_types vt ON vb.vehicle_type_id = vt.id
      WHERE vv.id = ?
    `).get(variant_id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle variant not found' });
    }

    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};
