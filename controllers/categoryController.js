const categoryService = require('../services/CategoryService');

/**
 * Create a new category
 * @route POST /api/categories
 * Requirements: 5.1, 6.1, 6.2, 6.3, 6.4, 15.1
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, status } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Category name is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate name length
    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category name cannot exceed 100 characters',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Description cannot exceed 500 characters',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status must be either "active" or "inactive"',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const category = await categoryService.createCategory({ 
      name, 
      description, 
      icon, 
      status 
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'DUPLICATE_CATEGORY_NAME'
        }
      });
    }

    next(error);
  }
};

/**
 * Get all categories with optional filters
 * @route GET /api/categories
 * Requirements: 5.2, 4.1, 4.2, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5
 */
const getAllCategories = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    // Build filters object
    const filters = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.search = search;
    }

    const categories = await categoryService.getAllCategories(filters);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a category by ID
 * @route GET /api/categories/:id
 * Requirements: 5.3, 15.3
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle 404 errors
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.message === 'Invalid category ID') {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Get a category by slug
 * @route GET /api/categories/slug/:slug
 * Requirements: 5.4, 15.3
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await categoryService.getCategoryBySlug(slug);

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle 404 errors
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    next(error);
  }
};

/**
 * Update a category by ID
 * @route PUT /api/categories/:id
 * Requirements: 5.5, 6.2, 6.3, 6.5, 15.1, 15.3
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, status } = req.body;

    // Validate that at least one field is provided
    if (!name && !description && icon === undefined && !status) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least one field (name, description, icon, or status) must be provided',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate name length if provided
    if (name && name.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category name cannot exceed 100 characters',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Description cannot exceed 500 characters',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status must be either "active" or "inactive"',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const category = await categoryService.updateCategory(id, { 
      name, 
      description, 
      icon, 
      status 
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'DUPLICATE_CATEGORY_NAME'
        }
      });
    }

    // Handle 404 errors
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.message === 'Invalid category ID') {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Delete a category by ID
 * @route DELETE /api/categories/:id
 * Requirements: 5.6, 15.2, 15.3
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      data: {
        message: result.message
      }
    });
  } catch (error) {
    // Handle category in use error
    if (error.message.includes('assigned documents')) {
      const match = error.message.match(/(\d+) assigned documents/);
      const documentCount = match ? parseInt(match[1]) : 0;
      
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'CATEGORY_IN_USE',
          details: {
            documentCount
          }
        }
      });
    }

    // Handle default category deletion attempt
    if (error.message.includes('default category')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'CANNOT_DELETE_DEFAULT'
        }
      });
    }

    // Handle 404 errors
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.message === 'Invalid category ID') {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Get documents by category with pagination
 * @route GET /api/categories/:id/documents
 * Requirements: 5.7, 4.4
 */
const getDocumentsByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, status } = req.query;

    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20
    };

    if (status) {
      options.status = status;
    }

    const result = await categoryService.getDocumentsByCategory(id, options);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    // Handle 404 errors
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND'
        }
      });
    }

    // Handle invalid ID format
    if (error.message === 'Invalid category ID') {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Reorder categories
 * @route PUT /api/categories/reorder
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 15.4
 */
const reorderCategories = async (req, res, next) => {
  try {
    const { order } = req.body;

    // Validate order array
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order array is required and must not be empty',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const categories = await categoryService.reorderCategories(order);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('Invalid category IDs') || 
        error.message.includes('do not exist') ||
        error.message.includes('Order array')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    next(error);
  }
};

/**
 * Get category statistics
 * @route GET /api/categories/statistics
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
const getCategoryStatistics = async (req, res, next) => {
  try {
    const statistics = await categoryService.getCategoryStatistics();

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getDocumentsByCategory,
  reorderCategories,
  getCategoryStatistics
};
