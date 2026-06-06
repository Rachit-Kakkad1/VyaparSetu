const express = require('express');
const shipmentController = require('../controllers/shipment.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/dispatch', restrictTo('VENDOR', 'ADMIN'), shipmentController.dispatchShipment);
router.get('/', restrictTo('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), shipmentController.getAllShipments);
router.get('/dashboard/summary', restrictTo('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), shipmentController.getDashboardSummary);
router.get('/:id', shipmentController.getShipmentById);
router.get('/:id/route', shipmentController.getRoute);
router.post('/:id/confirm-delivery', restrictTo('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), shipmentController.confirmDelivery);

module.exports = router;
