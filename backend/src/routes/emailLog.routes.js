const express = require('express');
const emailLogController = require('../controllers/emailLog.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN')); // Analytics and logs are admin only

router.get('/', emailLogController.getAllLogs);
router.get('/stats', emailLogController.getStats);
router.get('/:id', emailLogController.getLogById);

module.exports = router;
