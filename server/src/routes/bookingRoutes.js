const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// All booking routes require authentication
router.post('/', authMiddleware, bookingController.createBooking);

// Vendor availability — must be BEFORE /:id param route
router.get('/vendor-availability', authMiddleware, bookingController.getVendorAvailability);

router.get('/:id', authMiddleware, bookingController.getBooking);
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.get('/user/all', authMiddleware, bookingController.getUserBookings);

module.exports = router;