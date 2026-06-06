const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { invoiceValidator } = require('../validators/invoice.validator');

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('ADMIN', 'VENDOR'), invoiceValidator, validate, invoiceController.generateInvoice);
router.get('/:id', invoiceController.getInvoiceById);

module.exports = router;
