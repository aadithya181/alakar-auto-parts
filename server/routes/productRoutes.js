const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/suggestions', productController.getSearchSuggestions);
router.get('/check-compatibility', productController.checkCompatibility);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
