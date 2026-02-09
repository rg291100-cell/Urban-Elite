const express = require('express');
const router = express.Router();
const adminServiceController = require('../controllers/adminServiceController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check for Admin Role
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ success: false, error: 'Access denied. Admins only.' });
    }
};

// Apply auth and admin check to all routes
router.use(authMiddleware);
router.use(isAdmin);

// 1. Create Categories
router.post('/categories', adminServiceController.createCategory);

// 2. Manage Sub-Services (Items)
router.post('/items', adminServiceController.createServiceItem);
router.get('/items/:categoryId', adminServiceController.getServiceItems); // List by category

// 3. Vendor Assignment (Can be used by Admin to force assign, or specialized Vendor route)
// The user asked for "option to add subcategory so specialization of vendor is updated".
// This implies vendors might need to call this themselves, or admin does it.
// If vendors do it, we need a separate route for vendors. 
// For now, let's keep this as an Admin management route.
router.post('/assign-vendor', adminServiceController.assignServiceToVendor);

module.exports = router;
