const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');

// All vendor routes require authentication
router.use(authMiddleware);

// Vendor dashboard
router.get('/dashboard', vendorController.getDashboard);

// Vendor revenue
router.get('/revenue', vendorController.getRevenue);

// Vendor bookings
router.get('/bookings', vendorController.getBookings);
router.put('/bookings/:bookingId/status', vendorController.updateBookingStatus);

// Vendor services
router.get('/services', vendorController.getServices);
router.put('/services', vendorController.updateServices);

module.exports = router;
