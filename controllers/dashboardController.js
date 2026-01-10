const dashboardService = require('../services/DashboardService');

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/statistics
 * @desc Get comprehensive dashboard statistics including categories, documents, and images
 * @access Public
 * Requirements: 7.1, 7.2, 7.5
 */
const getDashboardStatistics = async (req, res, next) => {
  try {
    const statistics = await dashboardService.getDashboardStatistics();

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStatistics
};