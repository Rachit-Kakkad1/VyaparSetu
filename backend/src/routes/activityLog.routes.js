const express = require('express');
const activityLogController = require('../controllers/activityLog.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', activityLogController.getAllLogs);

module.exports = router;
