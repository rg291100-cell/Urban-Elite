const express = require('express');
const router = express.Router();
const { getHomeData, getServiceDetails, getServiceDetailById } = require('../controllers/homeController');

router.get('/home', getHomeData);
router.get('/services/:type', getServiceDetails);
router.get('/service/:id', getServiceDetailById);

module.exports = router;
