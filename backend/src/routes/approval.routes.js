const express = require('express');
const approvalController = require('../controllers/approval.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('ADMIN', 'PROCUREMENT_OFFICER'), approvalController.initiateApproval);

router.put('/:id/approve', restrictTo('MANAGER', 'ADMIN', 'PROCUREMENT_OFFICER'), (req, res, next) => {
  req.body.status = 'APPROVED';
  approvalController.processApproval(req, res, next);
});

router.put('/:id/reject', restrictTo('MANAGER', 'ADMIN', 'PROCUREMENT_OFFICER'), (req, res, next) => {
  req.body.status = 'REJECTED';
  approvalController.processApproval(req, res, next);
});

module.exports = router;
