const express = require('express');
const router = express.Router();
const adminRequestController = require('../controllers/adminRequestController');
const authMiddleware = require('../middleware/authMiddleware');

// User-facing routes (require user auth)
router.use(authMiddleware);

router.post('/', adminRequestController.createAdminRequest);
router.get('/my-requests', adminRequestController.getUserAdminRequests);

module.exports = router;
