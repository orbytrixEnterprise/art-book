const Category = require('../models/Category');
const Document = require('../models/Document');
const mongoose = require('mongoose');

class CategoryService {
  /**
   * Create a new category
   * Requirements: 2.1, 2.2, 2.3
   */
  async createCategory(data) {
    try {
      // Check if name already exists
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${data.name}$`, 'i') } 
      });
      
      if (existingCategory) {
        throw new Error('Category name already exists');
      }

      // Get next display order if not provided
      if (data.displayOrder === undefined) {
        data.displayOrder = await Category.getNextDisplayOrder();
      }

      const category = new Category(data);
      await category.save();
      
      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Category name already exists');
      }
      throw error;
    }
  }

  /**
   * Get all categories with optional filters
   * Requirements: 4.1, 4.2, 4.5
   */
  async getAllCategories(filters = {}) {
    const query = {};

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Apply search filter
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .populate('documentCount');

    return categories;
  }

  /**
   * Get category by ID
   * Requirements: 4.3
   */
  async getCategoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID');
    }

    const category = await Category.findById(id).populate('documentCount');
    
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Get category by slug
   * Requirements: 4.3
   */
  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug }).populate('documentCount');
    
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Update category
   * Requirements: 2.4, 2.5
   */
  async updateCategory(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID');
    }

    const category = await Category.findById(id);
    
    if (!category) {
      throw new Error('Category not found');
    }

    // Check name uniqueness if name is being changed
    if (data.name && data.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        throw new Error('Category name already exists');
      }
    }

    // Update fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        category[key] = data[key];
      }
    });

    await category.save();
    
    return category;
  }

  /**
   * Delete category
   * Requirements: 2.5, 2.6, 2.7, 12.2
   */
  async deleteCategory(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID');
    }

    const category = await Category.findById(id);
    
    if (!category) {
      throw new Error('Category not found');
    }

    // Prevent deletion of default category
    if (category.isDefault) {
      throw new Error('Cannot delete the default category');
    }

    // Check if category has documents
    const documentCount = await Document.countDocuments({ category: id });
    
    if (documentCount > 0) {
      throw new Error(`Cannot delete category because it has ${documentCount} assigned documents`);
    }

    await Category.findByIdAndDelete(id);
    
    return { success: true, message: 'Category deleted successfully' };
  }

  /**
   * Get documents by category with pagination
   * Requirements: 4.4
   */
  async getDocumentsByCategory(categoryId, options = {}) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error('Invalid category ID');
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { category: categoryId };
    
    // Apply status filter if provided
    if (options.status) {
      query.status = options.status;
    }

    const [documents, totalDocuments] = await Promise.all([
      Document.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug icon'),
      Document.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDocuments / limit);

    return {
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        icon: category.icon
      },
      documents,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocuments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Reorder categories
   * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
   */
  async reorderCategories(orderArray) {
    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new Error('Order array is required and must not be empty');
    }

    // Validate all category IDs
    const categoryIds = orderArray.map(item => item.categoryId || item);
    const invalidIds = categoryIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    
    if (invalidIds.length > 0) {
      throw new Error('Invalid category IDs in order array');
    }

    // Verify all categories exist
    const categories = await Category.find({ _id: { $in: categoryIds } });
    
    if (categories.length !== categoryIds.length) {
      throw new Error('Some categories in order array do not exist');
    }

    // Update display order for each category
    const updatePromises = orderArray.map((item, index) => {
      const categoryId = item.categoryId || item;
      return Category.findByIdAndUpdate(
        categoryId,
        { displayOrder: index + 1 },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Return updated categories sorted by new order
    const updatedCategories = await Category.find({ _id: { $in: categoryIds } })
      .sort({ displayOrder: 1 });

    return updatedCategories;
  }

  /**
   * Get category statistics
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
   */
  async getCategoryStatistics() {
    const [
      totalCategories,
      activeCategories,
      documentsByCategory
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ status: 'active' }),
      Document.aggregate([
        {
          $group: {
            _id: '$category',
            documentCount: { $sum: 1 },
            imageCount: { $sum: { $size: '$images' } }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $project: {
            categoryId: '$_id',
            categoryName: '$category.name',
            categorySlug: '$category.slug',
            categoryIcon: '$category.icon',
            documentCount: 1,
            imageCount: 1
          }
        },
        {
          $sort: { documentCount: -1 }
        }
      ])
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      categoriesWithDocuments: documentsByCategory.length,
      mostPopularCategories: documentsByCategory.slice(0, 5),
      documentsByCategory
    };
  }

  /**
   * Initialize default category
   * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
   */
  async initializeDefaultCategory() {
    try {
      // Check if default category already exists
      let defaultCategory = await Category.findOne({ isDefault: true });
      
      if (defaultCategory) {
        return {
          success: true,
          message: 'Default category already exists',
          category: defaultCategory,
          created: false
        };
      }

      // Create default "Uncategorized" category
      defaultCategory = new Category({
        name: 'Uncategorized',
        description: 'Documents without a specific category',
        icon: '📁',
        status: 'active',
        displayOrder: 999,
        isDefault: true
      });

      await defaultCategory.save();

      return {
        success: true,
        message: 'Default category created successfully',
        category: defaultCategory,
        created: true
      };
    } catch (error) {
      throw new Error(`Failed to initialize default category: ${error.message}`);
    }
  }
}

module.exports = new CategoryService();
