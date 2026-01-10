const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @route   GET /api/dashboard/statistics
 * @desc    Get comprehensive dashboard statistics
 * @access  Public
 */
router.get('/statistics', dashboardController.getDashboardStatistics);

module.exports = router;