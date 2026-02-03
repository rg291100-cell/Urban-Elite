const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offersController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (or auth required? Let's assume auth for now as standard)
router.use(authMiddleware);

router.get('/', offersController.getOffers);
router.post('/', offersController.createOffer);
router.get('/vendor', offersController.getVendorOffers);

module.exports = router;
