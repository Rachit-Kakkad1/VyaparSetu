const express = require('express');
const shipmentController = require('../controllers/shipment.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/dispatch', restrictTo('VENDOR', 'ADMIN'), shipmentController.dispatchShipment);
router.get('/', restrictTo('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), shipmentController.getAllShipments);
router.get('/:id', shipmentController.getShipmentById);

module.exports = router;
