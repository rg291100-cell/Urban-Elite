const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminServiceController = require('../controllers/adminServiceController');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes require admin authentication
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);

// Booking Management
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id', adminController.updateBookingStatus);

// Professional Management
router.get('/professionals', adminController.getAllProfessionals);
router.post('/professionals', adminController.createProfessional);
router.put('/professionals/:id', adminController.updateProfessional);
router.delete('/professionals/:id', adminController.deleteProfessional);

// Service Category Management
router.get('/services/categories', adminController.getAllServiceCategories);
router.post('/services/categories', adminController.createServiceCategory);
router.put('/services/categories/:id', adminController.updateServiceCategory);
router.delete('/services/categories/:id', adminController.deleteServiceCategory);

// Sub-Category Management (Level 2)
router.get('/services/subcategories/:categoryId', adminServiceController.getSubCategories);
router.post('/services/subcategories', adminServiceController.createSubCategory);

// Service Item Management
router.get('/services/categories/:categoryId/items', adminController.getServiceItems);
router.get('/services/listing/:subCategoryId', adminServiceController.getServiceListing);
router.post('/services/categories/:categoryId/items', adminController.createServiceItem);
router.post('/services/items', adminServiceController.createServiceItem);
router.put('/services/items/:id', adminController.updateServiceItem);
router.delete('/services/items/:id', adminController.deleteServiceItem);

// Vendor Management Routes
router.get('/vendors/pending', adminController.getPendingVendors);
router.get('/vendors', adminController.getAllVendors);
router.put('/vendors/:id/approve', adminController.approveVendor);
router.put('/vendors/:id/reject', adminController.rejectVendor);
router.post('/services/assign-vendor', adminController.assignServiceToVendor);

// Payment Management
router.get('/payments', adminController.getAllPayments);

module.exports = router;
