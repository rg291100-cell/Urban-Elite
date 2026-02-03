const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all chat routes
router.use(authMiddleware);

// Routes
router.get('/:bookingId', chatController.getMessages);
router.post('/:bookingId', chatController.sendMessage);

module.exports = router;
