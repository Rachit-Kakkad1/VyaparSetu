const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { invoiceValidator } = require('../validators/invoice.validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(invoiceController.getAllInvoices)
  .post(restrictTo('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), invoiceValidator, validate, invoiceController.createInvoice);

router.route('/:id')
  .get(invoiceController.getInvoiceById)
  .put(restrictTo('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), invoiceController.updateInvoice);

router.post('/:id/generate-pdf', restrictTo('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), invoiceController.generatePdf);

module.exports = router;
