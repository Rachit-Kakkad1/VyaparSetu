const express = require('express');
const quotationController = require('../controllers/quotation.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { quotationValidator } = require('../validators/quotation.validator');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('ADMIN', 'PROCUREMENT_OFFICER'), quotationController.getAllQuotations);
router.post('/', 
  restrictTo('VENDOR'),
  upload.array('documents', 5),
  (req, res, next) => {
    if (req.files) {
      req.body.documents = req.files.map(file => file.path);
    }
    next();
  },
  quotationValidator, 
  validate, 
  quotationController.submitQuotation
);
router.get('/:id', quotationController.getQuotationById);
router.get('/rfq/:rfqId', restrictTo('ADMIN', 'PROCUREMENT_OFFICER'), quotationController.getQuotationsByRfq);

module.exports = router;
