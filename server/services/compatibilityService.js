const db = require('../config/db');

class CompatibilityService {
  /**
   * Check if a specific product is compatible with a vehicle variant and optional year
   */
  checkProductFit(productId, variantId, year = null) {
    let query = `
      SELECT pc.*, vv.name as variant_name, vm.name as model_name, vb.name as brand_name
      FROM product_compatibility pc
      JOIN vehicle_variants vv ON pc.vehicle_variant_id = vv.id
      JOIN vehicle_models vm ON vv.model_id = vm.id
      JOIN vehicle_brands vb ON vm.brand_id = vb.id
      WHERE pc.product_id = ? AND pc.vehicle_variant_id = ?
    `;
    const params = [productId, variantId];

    const fit = db.prepare(query).get(...params);

    if (!fit) {
      return {
        isCompatible: false,
        message: 'This product is not verified for the selected vehicle.',
      };
    }

    if (year) {
      const yearNum = parseInt(year, 10);
      if (fit.year_from && yearNum < fit.year_from) {
        return {
          isCompatible: false,
          message: `Fits ${fit.brand_name} ${fit.model_name} ${fit.variant_name} from ${fit.year_from} onwards only.`,
        };
      }
      if (fit.year_to && yearNum > fit.year_to) {
        return {
          isCompatible: false,
          message: `Fits ${fit.brand_name} ${fit.model_name} ${fit.variant_name} up to ${fit.year_to} only.`,
        };
      }
    }

    return {
      isCompatible: true,
      message: `Guaranteed Fit for ${fit.brand_name} ${fit.model_name} ${fit.variant_name}${year ? ` (${year})` : ''}`,
      fitDetails: fit,
    };
  }

  /**
   * Get all compatible vehicles for a given product
   */
  getCompatibleVehicles(productId) {
    const query = `
      SELECT pc.*, vv.name as variant_name, vv.fuel_type, vv.engine_capacity,
             vm.name as model_name, vm.slug as model_slug,
             vb.name as brand_name, vb.slug as brand_slug, vb.vehicle_type_id
      FROM product_compatibility pc
      JOIN vehicle_variants vv ON pc.vehicle_variant_id = vv.id
      JOIN vehicle_models vm ON vv.model_id = vm.id
      JOIN vehicle_brands vb ON vm.brand_id = vb.id
      WHERE pc.product_id = ?
      ORDER BY vb.name ASC, vm.name ASC, vv.year_from DESC
    `;
    return db.prepare(query).all(productId);
  }
}

module.exports = new CompatibilityService();
