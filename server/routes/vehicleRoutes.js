const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/types', vehicleController.getVehicleTypes);
router.get('/brands', vehicleController.getBrands);
router.get('/models', vehicleController.getModels);
router.get('/variants', vehicleController.getVariants);
router.get('/details/:variant_id', vehicleController.getVehicleFullDetails);

module.exports = router;
