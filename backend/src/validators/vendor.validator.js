const { body } = require('express-validator');

const vendorValidator = [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('contactEmail').isEmail().withMessage('Must be a valid email address'),
  body('registrationNumber').optional().isString(),
  body('taxId').optional().isString(),
  body('contactPhone').optional().isString()
];

module.exports = { vendorValidator };
