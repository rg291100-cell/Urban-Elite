const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// All booking routes require authentication
router.post('/', authMiddleware, bookingController.createBooking);
router.get('/:id', authMiddleware, bookingController.getBooking);
router.get('/:id/tracking', authMiddleware, bookingController.getBookingTracking);
router.get('/user/all', authMiddleware, bookingController.getUserBookings);

module.exports = router;
