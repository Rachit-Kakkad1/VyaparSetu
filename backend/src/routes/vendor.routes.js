const express = require('express');
const vendorController = require('../controllers/vendor.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { vendorValidator } = require('../validators/vendor.validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(vendorController.getAllVendors)
  .post(restrictTo('ADMIN', 'PROCUREMENT_OFFICER'), vendorValidator, validate, vendorController.createVendor);

router.route('/:id')
  .get(vendorController.getVendorById)
  .put(restrictTo('ADMIN', 'PROCUREMENT_OFFICER'), vendorValidator, validate, vendorController.updateVendor)
  .delete(restrictTo('ADMIN'), vendorController.deleteVendor);

module.exports = router;
