const { body } = require('express-validator');

const poValidator = [
  body('quotationId').isUUID().withMessage('Valid Quotation ID is required')
];

module.exports = { poValidator };
