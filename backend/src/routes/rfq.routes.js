const express = require('express');
const rfqController = require('../controllers/rfq.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { rfqValidator } = require('../validators/rfq.validator');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(rfqController.getAllRfqs)
  .post(
    restrictTo('ADMIN', 'PROCUREMENT_OFFICER'),
    upload.array('documents', 5),
    (req, res, next) => {
      // Map uploaded files to documents array
      if (req.files) {
        req.body.documents = req.files.map(file => file.path);
      }
      next();
    },
    rfqValidator, 
    validate, 
    rfqController.createRfq
  );

router.route('/:id')
  .get(rfqController.getRfqById);

module.exports = router;
