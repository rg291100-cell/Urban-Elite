const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getUserProfile, updateProfile,
    getUserWallet, topupWallet,
    getUserBookings,
    getAddresses, addAddress, deleteAddress,
    getPaymentMethods, addPaymentMethod, deletePaymentMethod,
    getNotificationSettings, updateNotificationSettings
} = require('../controllers/userController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Profile
router.get('/profile', getUserProfile);
router.put('/profile', updateProfile);

// Wallet
router.get('/wallet', getUserWallet);
router.post('/wallet/topup', topupWallet);

// Bookings
router.get('/bookings', getUserBookings);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);

// Payment Methods
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);

// Notifications
router.get('/notifications/settings', getNotificationSettings);
router.put('/notifications/settings', updateNotificationSettings);

module.exports = router;
