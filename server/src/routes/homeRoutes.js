const express = require('express');
const router = express.Router();
const { getHomeData, getServiceDetails, getServiceDetailById, getServiceCategories } = require('../controllers/homeController');

router.get('/', getHomeData);
router.get('/services/categories', getServiceCategories);
router.get('/services/:type', getServiceDetails);
router.get('/service/:id', getServiceDetailById);

module.exports = router;
