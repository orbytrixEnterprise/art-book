const categoryService = require('../services/CategoryService');
const { CategoryError, formatErrorResponse } = require('../utils/categoryErrors');

/**
 * Create a new category
 * @route POST /api/categories
 * Requirements: 5.1, 6.1, 6.2, 6.3, 6.4, 15.1
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, status } = req.body;

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
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
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

    // Handle empty results with appropriate message (requirement 9.5)
    if (categories.length === 0 && (filters.search || filters.status)) {
      let message = 'No categories found';
      
      if (filters.search && filters.status) {
        message = `No categories found matching search "${filters.search}" with status "${filters.status}"`;
      } else if (filters.search) {
        message = `No categories found matching search "${filters.search}"`;
      } else if (filters.status) {
        message = `No categories found with status "${filters.status}"`;
      }
      
      return res.status(200).json({
        success: true,
        data: categories,
        message: message
      });
    }

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
    }

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
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
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
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
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
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
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
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
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
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
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

    const categories = await categoryService.reorderCategories(order);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
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
    // Handle CategoryError instances with structured error responses
    if (error instanceof CategoryError) {
      return res.status(error.statusCode).json(formatErrorResponse(error));
    }

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
