const { body } = require('express-validator');

const quotationValidator = [
  body('rfqId').isUUID().withMessage('Valid RFQ ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.rfqItemId').isUUID().withMessage('Valid RFQ Item ID is required'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive number')
];

module.exports = { quotationValidator };
