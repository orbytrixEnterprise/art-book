const Document = require('../models/Document');
const Category = require('../models/Category');
const categoryService = require('./CategoryService');

class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   * Requirements: 7.1, 7.2, 7.5
   */
  async getDashboardStatistics() {
    try {
      // Get category statistics using existing service
      const categoryStats = await categoryService.getCategoryStatistics();
      
      // Get document statistics
      const [
        totalDocuments,
        activeDocuments,
        inactiveDocuments,
        totalImages,
        recentDocuments
      ] = await Promise.all([
        Document.countDocuments(),
        Document.countDocuments({ status: 'active' }),
        Document.countDocuments({ status: 'deactive' }),
        Document.aggregate([
          {
            $group: {
              _id: null,
              totalImages: { $sum: { $size: '$images' } }
            }
          }
        ]),
        Document.find({ status: 'active' })
          .sort({ createdAt: -1 })
          .limit(6)
          .populate('category', 'name slug icon')
      ]);

      // Extract total images count
      const imageCount = totalImages.length > 0 ? totalImages[0].totalImages : 0;

      return {
        // Document statistics
        documents: {
          total: totalDocuments,
          active: activeDocuments,
          inactive: inactiveDocuments
        },
        
        // Category statistics (from existing service)
        categories: {
          total: categoryStats.totalCategories,
          active: categoryStats.activeCategories,
          inactive: categoryStats.inactiveCategories,
          withDocuments: categoryStats.categoriesWithDocuments
        },
        
        // Image statistics
        images: {
          total: imageCount
        },
        
        // Most popular categories by document count
        mostPopularCategories: categoryStats.mostPopularCategories,
        
        // Recent documents
        recentDocuments: recentDocuments.map(doc => ({
          _id: doc._id,
          title: doc.title,
          description: doc.description.length > 100 
            ? doc.description.substring(0, 100) + '...' 
            : doc.description,
          category: doc.category,
          main_image: doc.main_image,
          createdAt: doc.createdAt
        })),
        
        // Summary
        summary: {
          totalItems: totalDocuments + categoryStats.totalCategories,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to retrieve dashboard statistics: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();