const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/user', authenticateToken, orderController.getUserOrders);
router.get('/:id', optionalAuth, orderController.getOrderDetails);

module.exports = router;
