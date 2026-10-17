const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.post('/validate', couponController.validateCoupon);
router.get('/validate', (req, res, next) => {
  req.body = { ...req.query, ...req.body };
  return couponController.validateCoupon(req, res, next);
});

module.exports = router;
