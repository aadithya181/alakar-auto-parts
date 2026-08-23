const productService = require('../services/productService');
const compatibilityService = require('../services/compatibilityService');

exports.getProducts = (req, res, next) => {
  try {
    const result = productService.getProducts(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductBySlug = (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = productService.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.checkCompatibility = (req, res, next) => {
  try {
    const { product_id, vehicle_variant_id, year } = req.query;
    if (!product_id || !vehicle_variant_id) {
      return res.status(400).json({ success: false, message: 'product_id and vehicle_variant_id are required' });
    }

    const fitResult = compatibilityService.checkProductFit(product_id, vehicle_variant_id, year);
    res.json({ success: true, ...fitResult });
  } catch (err) {
    next(err);
  }
};

exports.getSearchSuggestions = (req, res, next) => {
  try {
    const { q } = req.query;
    const suggestions = productService.getSearchSuggestions(q);
    res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
};
