const Category = require('../models/Category');
const Document = require('../models/Document');
const mongoose = require('mongoose');
const {
  CategoryError,
  createDuplicateNameError,
  createNotFoundError,
  createCategoryInUseError,
  createCannotDeleteDefaultError,
  createInvalidIdError,
  createInactiveCategoryError,
  createValidationError,
  validateCategoryId,
  handleMongooseError,
  logCategoryError
} = require('../utils/categoryErrors');

class CategoryService {
  /**
   * Create a new category
   * Requirements: 2.1, 2.2, 2.3, 15.1
   */
  async createCategory(data) {
    const operation = 'createCategory';
    const context = { categoryData: { name: data.name, status: data.status } };
    
    try {
      // Validate category name
      if (!data.name || data.name.trim().length === 0) {
        throw createValidationError('Category name is required');
      }
      
      if (data.name.length > 100) {
        throw createValidationError('Category name cannot exceed 100 characters');
      }
      
      // Validate description length if provided
      if (data.description && data.description.length > 500) {
        throw createValidationError('Description cannot exceed 500 characters');
      }
      
      // Check if name already exists (case-insensitive)
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
      });
      
      if (existingCategory) {
        throw createDuplicateNameError(data.name.trim());
      }
      
      // Get next display order
      const lastCategory = await Category.findOne().sort({ displayOrder: -1 });
      const displayOrder = lastCategory ? lastCategory.displayOrder + 1 : 1;
      
      // Create category
      const category = new Category({
        name: data.name.trim(),
        description: data.description || '',
        icon: data.icon || '📁',
        status: data.status || 'active',
        displayOrder
      });
      
      await category.save();
      
      // Populate document count
      await category.populate('documentCount');
      
      logCategoryError(new Error('Category created successfully'), operation, { 
        ...context, 
        categoryId: category._id,
        success: true 
      });
      
      return category;
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Get all categories with optional filters
   * Requirements: 4.1, 4.2, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5
   */
  async getAllCategories(filters = {}) {
    const operation = 'getAllCategories';
    const context = { filters };
    
    try {
      const query = {};
      
      // Apply status filter
      if (filters.status) {
        if (!['active', 'inactive'].includes(filters.status)) {
          throw createValidationError('Status must be either "active" or "inactive"');
        }
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
        .populate('documentCount')
        .sort({ displayOrder: 1, name: 1 });
      
      return categories;
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Get category by ID
   * Requirements: 5.3, 15.3
   */
  async getCategoryById(id) {
    const operation = 'getCategoryById';
    const context = { categoryId: id };
    
    try {
      validateCategoryId(id);
      
      const category = await Category.findById(id).populate('documentCount');
      
      if (!category) {
        throw createNotFoundError(id);
      }
      
      return category;
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Get category by slug
   * Requirements: 5.4, 15.3
   */
  async getCategoryBySlug(slug) {
    const operation = 'getCategoryBySlug';
    const context = { slug };
    
    try {
      if (!slug || slug.trim().length === 0) {
        throw createValidationError('Category slug is required');
      }
      
      const category = await Category.findOne({ slug: slug.trim() }).populate('documentCount');
      
      if (!category) {
        throw createNotFoundError(slug);
      }
      
      return category;
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Update category
   * Requirements: 5.5, 6.2, 6.3, 6.5, 15.1, 15.3
   */
  async updateCategory(id, data) {
    const operation = 'updateCategory';
    const context = { categoryId: id, updateData: data };
    
    try {
      validateCategoryId(id);
      
      // Validate update data
      if (data.name !== undefined) {
        if (!data.name || data.name.trim().length === 0) {
          throw createValidationError('Category name cannot be empty');
        }
        
        if (data.name.length > 100) {
          throw createValidationError('Category name cannot exceed 100 characters');
        }
        
        // Check for duplicate name (excluding current category)
        const existingCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') },
          _id: { $ne: id }
        });
        
        if (existingCategory) {
          throw createDuplicateNameError(data.name.trim());
        }
      }
      
      if (data.description !== undefined && data.description.length > 500) {
        throw createValidationError('Description cannot exceed 500 characters');
      }
      
      if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
        throw createValidationError('Status must be either "active" or "inactive"');
      }
      
      // Build update object
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined) updateData.description = data.description;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.status !== undefined) updateData.status = data.status;
      
      const category = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('documentCount');
      
      if (!category) {
        throw createNotFoundError(id);
      }
      
      return category;
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Delete category
   * Requirements: 5.6, 15.2, 15.3
   */
  async deleteCategory(id) {
    const operation = 'deleteCategory';
    const context = { categoryId: id };
    
    try {
      validateCategoryId(id);
      
      const category = await Category.findById(id);
      
      if (!category) {
        throw createNotFoundError(id);
      }
      
      // Check if it's the default category
      if (category.isDefault) {
        throw createCannotDeleteDefaultError();
      }
      
      // Check if category has assigned documents
      const documentCount = await Document.countDocuments({ category: id });
      
      if (documentCount > 0) {
        throw createCategoryInUseError(category.name, documentCount);
      }
      
      await Category.findByIdAndDelete(id);
      
      return {
        success: true,
        message: `Category '${category.name}' deleted successfully`
      };
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Get documents by category with pagination
   * Requirements: 5.7, 4.4
   */
  async getDocumentsByCategory(categoryId, options = {}) {
    const operation = 'getDocumentsByCategory';
    const context = { categoryId, options };
    
    try {
      validateCategoryId(categoryId);
      
      const category = await Category.findById(categoryId);
      
      if (!category) {
        throw createNotFoundError(categoryId);
      }
      
      const page = Math.max(1, parseInt(options.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
      const skip = (page - 1) * limit;
      
      const query = { category: categoryId };
      
      if (options.status) {
        if (!['active', 'deactive'].includes(options.status)) {
          throw createValidationError('Document status must be either "active" or "deactive"');
        }
        query.status = options.status;
      }
      
      const [documents, totalDocuments] = await Promise.all([
        Document.find(query)
          .populate('category')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
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
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Reorder categories
   * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 15.4
   */
  async reorderCategories(orderArray) {
    const operation = 'reorderCategories';
    const context = { orderArray };
    
    try {
      if (!Array.isArray(orderArray) || orderArray.length === 0) {
        throw createValidationError('Order array is required and must not be empty');
      }
      
      // Validate all category IDs
      for (const categoryId of orderArray) {
        validateCategoryId(categoryId);
      }
      
      // Check if all categories exist
      const categories = await Category.find({ _id: { $in: orderArray } });
      
      if (categories.length !== orderArray.length) {
        const foundIds = categories.map(cat => cat._id.toString());
        const missingIds = orderArray.filter(id => !foundIds.includes(id));
        throw createValidationError(`Invalid category IDs: ${missingIds.join(', ')}`);
      }
      
      // Update display order for each category
      const updatePromises = orderArray.map((categoryId, index) => 
        Category.findByIdAndUpdate(
          categoryId,
          { displayOrder: index + 1 },
          { new: true }
        )
      );
      
      const updatedCategories = await Promise.all(updatePromises);
      
      // Return categories sorted by new order
      return updatedCategories.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Get category statistics
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
   */
  async getCategoryStatistics() {
    const operation = 'getCategoryStatistics';
    const context = {};
    
    try {
      const [
        totalCategories,
        activeCategories,
        categoryStats
      ] = await Promise.all([
        Category.countDocuments(),
        Category.countDocuments({ status: 'active' }),
        Category.aggregate([
          {
            $lookup: {
              from: 'documents',
              localField: '_id',
              foreignField: 'category',
              as: 'documents'
            }
          },
          {
            $project: {
              name: 1,
              icon: 1,
              status: 1,
              documentCount: { $size: '$documents' }
            }
          },
          {
            $sort: { documentCount: -1 }
          },
          {
            $limit: 10
          }
        ])
      ]);
      
      return {
        totalCategories,
        activeCategories,
        inactiveCategories: totalCategories - activeCategories,
        mostPopularCategories: categoryStats
      };
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }

  /**
   * Initialize default category
   * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
   */
  async initializeDefaultCategory() {
    const operation = 'initializeDefaultCategory';
    const context = {};
    
    try {
      // Check if default category already exists
      const existingDefault = await Category.findOne({ isDefault: true });
      
      if (existingDefault) {
        return {
          success: true,
          message: 'Default category already exists',
          category: existingDefault
        };
      }
      
      // Create default "Uncategorized" category
      const defaultCategory = new Category({
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Documents without a specific category',
        icon: '📁',
        status: 'active',
        displayOrder: 999,
        isDefault: true
      });
      
      await defaultCategory.save();
      
      logCategoryError(new Error('Default category initialized successfully'), operation, { 
        ...context, 
        categoryId: defaultCategory._id,
        success: true 
      });
      
      return {
        success: true,
        message: 'Default category created successfully',
        category: defaultCategory
      };
    } catch (error) {
      const categoryError = handleMongooseError(error, operation);
      logCategoryError(categoryError, operation, context);
      throw categoryError;
    }
  }
}

module.exports = new CategoryService();