const { body } = require('express-validator');

const invoiceValidator = [
  body('poId').isUUID().withMessage('Valid PO ID is required'),
  body('taxRate').optional().isFloat({ min: 0 }).withMessage('Tax rate must be a positive number')
];

module.exports = { invoiceValidator };
