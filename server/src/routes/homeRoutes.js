const express = require('express');
const router = express.Router();
const { getHomeData, getSubCategories, getServiceListing, getServiceDetailById, getServiceCategories } = require('../controllers/homeController');

router.get('/', getHomeData);
router.get('/services/categories', getServiceCategories);

// Level 2: Get Subcategories for a Category
router.get('/subcategories/:slug', getSubCategories);

// Level 3: Get Service Items (Listing) for a Subcategory
router.get('/listing/:slug', getServiceListing);

// Specific Item Detail
router.get('/service/:id', getServiceDetailById);

module.exports = router;
