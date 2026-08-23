const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// All admin routes protected by token + admin role check
router.use(authenticateToken, requireAdmin);

router.get('/stats', adminController.getDashboardStats);

// Products
router.get('/products', adminController.getAdminProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Compatibility
router.post('/compatibility', adminController.addCompatibilityMapping);
router.delete('/compatibility/:id', adminController.deleteCompatibilityMapping);

// Orders
router.get('/orders', adminController.getAdminOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Customers
router.get('/customers', adminController.getAdminCustomers);

// Coupons
router.get('/coupons', adminController.getAdminCoupons);
router.post('/coupons', adminController.createAdminCoupon);

module.exports = router;
