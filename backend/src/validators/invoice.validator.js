const { body } = require('express-validator');

const invoiceValidator = [
  body('invoiceNumber').notEmpty().withMessage('Invoice number is required'),
  body('invoiceType').isIn(['STANDARD', 'GST', 'PROFORMA']).withMessage('Invalid invoice type'),
  body('invoiceDate').isISO8601().withMessage('Valid invoice date is required'),
  body('vendorId').isUUID().withMessage('Valid Vendor ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemDescription').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('poId').optional().isUUID().withMessage('Invalid PO ID format'),
  body('rfqId').optional().isUUID().withMessage('Invalid RFQ ID format'),
  body('quotationId').optional().isUUID().withMessage('Invalid Quotation ID format'),
  body('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a positive number'),
  body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a positive number'),
  body('additionalCharges').optional().isFloat({ min: 0 }).withMessage('Additional charges must be a positive number')
];

module.exports = { invoiceValidator };
