const express = require('express');
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', chatController.getMyConversations);
router.post('/messages', chatController.sendMessage);

module.exports = router;
