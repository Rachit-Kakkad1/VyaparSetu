const { body } = require('express-validator');

const rfqValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('deadline').isISO8601().toDate().withMessage('Must be a valid date'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemName').notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.uom').notEmpty().withMessage('Unit of Measure is required')
];

module.exports = { rfqValidator };
